"use client"
 
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { aspectRatioOptions, creditFee, defaultValues, transformationTypes } from "@/constants"
import { CustomField } from "./CustomField"
import { useEffect, useState, useTransition } from "react"
import { AspectRatioKey, debounce, deepMergeObjects } from "@/lib/utils"
import MediaUploader from "./MediaUploader"
import TransformedImage from "./TransformedImage"
import { updateCredits } from "@/lib/actions/user.actions"
import { getCldImageUrl } from "next-cloudinary"
import { addImage, updateImage } from "@/lib/actions/image.actions"
import { useRouter } from "next/navigation"
import { InsufficientCreditsModal } from "./InsufficientCreditsModal"



export const formSchema = z.object({
    title: z.string(),
    aspectRatio: z.string().optional(),
    color: z.string().optional(),
    prompt: z.string().optional(),
    publicId: z.string(),
})


const TransformationForm = ({ action, data = null, userId, type, creditBalance, config = null }: TransformationFormProps) => {
    const transformationType = transformationTypes[type];
    const [image, setImage] = useState(data)
    const [newTransformation, setNewTransformation] = useState<Transformations | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isTransforming, setIsTransforming] = useState(false);
    const [transformationConfig, setTransformationConfig] = useState(config)
    const [isPending, startTransition] = useTransition()
    const router = useRouter()
    
    
    // 初期値の設定
    const initialValues = data && action === 'Update' ? {
      // タイトル
      title: data?.title,
      // アスペクト比
      aspectRatio: data?.aspectRatio,
      // 色
      color: data?.color,
      // プロンプト
      prompt: data?.prompt,
      // 公開ID
      publicId: data?.publicId,
    } : defaultValues

    // 1. フォームの定義
    const form = useForm<z.infer<typeof formSchema>>({
      // バリデーションリゾルバー
      resolver: zodResolver(formSchema),
      // 初期値
      defaultValues: initialValues,
    })
   
    // 2. 送信ハンドラの定義
    async function onSubmit(values: z.infer<typeof formSchema>) {
      // 送信中フラグを設定
      setIsSubmitting(true);
  
      // データまたは画像が存在する場合
      if(data || image) {
        // 変換URLの生成
        const transformationUrl = getCldImageUrl({
          // 幅
          width: image?.width,
          // 高さ
          height: image?.height,
          // ソースID
          src: image?.publicId,
          // 変換設定
          ...transformationConfig
        })
  
        // 画像データの準備
        const imageData = {
          // タイトル
          title: values.title,
          // 公開ID
          publicId: image?.publicId,
          // 変換タイプ
          transformationType: type,
          // 幅
          width: image?.width,
          // 高さ
          height: image?.height,
          // 変換設定
          config: transformationConfig,
          // セキュアURL
          secureURL: image?.secureURL,
          // 変換URL
          transformationURL: transformationUrl,
          // アスペクト比
          aspectRatio: values.aspectRatio,
          // プロンプト
          prompt: values.prompt,
          // 色
          color: values.color,
        }
  
        // アクションが'Add'の場合
        if(action === 'Add') {
          try {
            // 新しい画像の追加
            const newImage = await addImage({
              // 画像データ
              image: imageData,
              // ユーザーID
              userId,
              // パス
              path: '/'
            })
  
            // 新しい画像が存在する場合
            if(newImage) {
              // フォームのリセット
              form.reset()
              // 画像の設定
              setImage(data)
              // 画像詳細ページへリダイレクト
              router.push(`/transformations/${newImage._id}`)
            }
          } catch (error) {
            // エラーログ
            console.log(error);
          }
        }
  
        // アクションが'Update'の場合
        if(action === 'Update') {
          try {
            // 画像の更新
            const updatedImage = await updateImage({
              // 画像データ
              image: {
                ...imageData,
                // ID
                _id: data._id
              },
              // ユーザーID
              userId,
              // パス
              path: `/transformations/${data._id}`
            })
  
            // 更新された画像が存在する場合
            if(updatedImage) {
              // 画像詳細ページへリダイレクト
              router.push(`/transformations/${updatedImage._id}`)
            }
          } catch (error) {
            // エラーログ
            console.log(error);
          }
        }
      }
  
      // 送信中フラグをリセット
      setIsSubmitting(false)
    }
  
    // 選択フィールドのハンドラ
    const onSelectFieldHandler = (value: string, onChangeField: (value: string) => void) => {
      // 画像サイズの取得
      const imageSize = aspectRatioOptions[value as AspectRatioKey]
  
      // 画像の設定
      setImage((prevState: any) => ({
        ...prevState,
        // アスペクト比
        aspectRatio: imageSize.aspectRatio,
        // 幅
        width: imageSize.width,
        // 高さ
        height: imageSize.height,
      }))
  
      // 新しい変換の設定
      setNewTransformation(transformationType.config);
  
      // フィールドの値を変更
      return onChangeField(value)
    }
  
    // 入力フィールドのハンドラ
    const onInputChangeHandler = (fieldName: string, value: string, type: string, onChangeField: (value: string) => void) => {
      // デバウンス
      debounce(() => {
        // 新しい変換の設定
        setNewTransformation((prevState: any) => ({
          ...prevState,
          [type]: {
            ...prevState?.[type],
            // プロンプトまたは'to'
            [fieldName === 'prompt' ? 'prompt' : 'to' ]: value 
          }
        }))
      }, 1000)();
        
      // フィールドの値を変更
      return onChangeField(value)
    }
  
    // 変換ハンドラ
    const onTransformHandler = async () => {
      // 変換中フラグを設定
      setIsTransforming(true)
  
      // 変換設定の更新
      setTransformationConfig(
        deepMergeObjects(newTransformation, transformationConfig)
      )
  
      // 新しい変換のリセット
      setNewTransformation(null)
  
      // クレジットの更新
      startTransition(async () => {
        await updateCredits(userId, creditFee)
      })
    }
  
    // 画像や変換タイプが変更されたときの副作用
    useEffect(() => {
      // 画像が存在し、変換タイプが'restore'または'removeBackground'の場合
      if(image && (type === 'restore' || type === 'removeBackground')) {
        // 新しい変換の設定
        setNewTransformation(transformationType.config)
      }
    }, [image, transformationType.config, type])

    return (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {creditBalance < Math.abs(creditFee) && <InsufficientCreditsModal />}
            <CustomField 
              control={form.control}
              name="title"
              formLabel="Image Title"
              className="w-full"
              render={({ field }) => <Input {...field} className="input-field" />}
            />
    
            {type === 'fill' && (
              <CustomField
                control={form.control}
                name="aspectRatio"
                formLabel="Aspect Ratio"
                className="w-full"
                render={({ field }) => (
                  <Select
                    onValueChange={(value: any) => onSelectFieldHandler(value, field.onChange)}
                    value={field.value}
                  >
                    <SelectTrigger className="select-field">
                      <SelectValue placeholder="Select size" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.keys(aspectRatioOptions).map((key) => (
                        <SelectItem key={key} value={key} className="select-item">
                          {aspectRatioOptions[key as AspectRatioKey].label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}  
              />
            )}
    
            {(type === 'remove' || type === 'recolor') && (
              <div className="prompt-field">
                <CustomField 
                  control={form.control}
                  name="prompt"
                  formLabel={
                    type === 'remove' ? 'Object to remove' : 'Object to recolor'
                  }
                  className="w-full"
                  render={({ field }) => (
                    <Input 
                      value={field.value}
                      className="input-field"
                      onChange={(e) => onInputChangeHandler(
                        'prompt',
                        e.target.value,
                        type,
                        field.onChange
                      )}
                    />
                  )}
                />
    
                {type === 'recolor' && (
                  <CustomField 
                    control={form.control}
                    name="color"
                    formLabel="Replacement Color"
                    className="w-full"
                    render={({ field }) => (
                      <Input 
                        value={field.value}
                        className="input-field"
                        onChange={(e) => onInputChangeHandler(
                          'color',
                          e.target.value,
                          'recolor',
                          field.onChange
                        )}
                      />
                    )}
                  />
                )}
              </div>
            )}
    
            <div className="media-uploader-field">
              <CustomField 
                control={form.control}
                name="publicId"
                className="flex size-full flex-col"
                render={({ field }) => (
                  <MediaUploader 
                    onValueChange={field.onChange}
                    setImage={setImage}
                    publicId={field.value}
                    image={image}
                    type={type}
                  />
                )}
              />
    
              <TransformedImage 
                image={image}
                type={type}
                title={form.getValues().title}
                isTransforming={isTransforming}
                setIsTransforming={setIsTransforming}
                transformationConfig={transformationConfig}
              />
            </div>
    
            <div className="flex flex-col gap-4">
              <Button 
                type="button"
                className="submit-button capitalize"
                disabled={isTransforming || newTransformation === null}
                onClick={onTransformHandler}
              >
                {isTransforming ? 'Transforming...' : 'Apply Transformation'}
              </Button>
              <Button 
                type="submit"
                className="submit-button capitalize"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Save Image'}
              </Button>
            </div>
          </form>
        </Form>
      )
}


export default TransformationForm
