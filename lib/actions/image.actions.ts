"use server"

import { revalidatePath } from "next/cache";
import { connectToDatabase } from "../database/mongoose";
import { handleError } from "../utils";
import User from "../database/models/user.model";
import Image from "../database/models/image.model";
import { redirect } from "next/navigation";
import { v2 as cloudinary } from "cloudinary";

const populateUser = (query: any) => 
    query.populate({
        path: "author",
        model: User,
        select: "_id firstName lastName clerkId",
    });



//ADD Image
export async function addImage({ image, userId, path }: AddImageParams) {
    try {
        await connectToDatabase();

        const author = await User.findById(userId);

        if (!author) throw new Error("User not found");

        const newImage = await Image.create({
            ...image,
            author: author._id,
        })

        revalidatePath(path);
      
        return JSON.parse(JSON.stringify(newImage));
    } catch (error) {
        handleError(error);
    }
}


//UPDATE Image
export async function updateImage({ image, userId, path }: UpdateImageParams) {
    try {
        await connectToDatabase();

        const imageToUpdate = await Image.findById(image._id);

        if (!imageToUpdate || imageToUpdate.author.toHexString() !== userId) {
            throw new Error("Unauthorized Image not found");
        }

        const updateImage = await Image.findByIdAndUpdate(
            image._id, 
            image, 
            { new: true }
        )

        revalidatePath(path);
      
        return JSON.parse(JSON.stringify(updateImage));
    } catch (error) {
        handleError(error);
    }
}

//DELETE Image
export async function deleteImage(imageId:string) {
    try {
        await connectToDatabase();

        await Image.findByIdAndDelete(imageId);

    } catch (error) {
        handleError(error);
    } finally {
        redirect("/");
    }
}


// GET Image
export async function getImageById(imageId: string) {
    try {
      await connectToDatabase();
  
      const image = await populateUser(Image.findById(imageId));
  
      if(!image) throw new Error("Image not found");
  
      return JSON.parse(JSON.stringify(image));
    } catch (error) {
      handleError(error)
    }
}

// GET ALL Images
export async function getAllImages({
    limit = 9, // ページあたりの画像数の上限
    page = 1, // 現在のページ番号
    searchQuery = "", // 検索クエリ
}: {
    limit?: number;
    page?: number;
    searchQuery?: string;
}) {
    try {
      // データベースに接続
      await connectToDatabase();
  
      // Cloudinaryの設定
      cloudinary.config({
            cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET,
            secure: true,
      })

      // 検索式の設定
      let expression = "folder=imaginify";

      // 検索クエリがある場合、検索式に追加
      if (searchQuery) {
        expression += `AND ${searchQuery}`;
      }

      // Cloudinaryで検索を実行
      const { resources } = await cloudinary.search
        .expression(expression)
        .execute()

      // 取得したリソースのIDを抽出
      const resourcesIds = resources.map((resource: any) => resource.public_id);

      let query = {}
      
      // 検索クエリがある場合、クエリを設定
      if(searchQuery) {
        query = {
            publicId: {
                $in: resourcesIds
            }
        }
      }

      // スキップする画像数を計算
      const skipAmount = (Number(page) -1) * limit;

      // 画像を取得
      const images = await populateUser(Image.find(query)
        .sort({ updatedAt: -1 }) // 更新日時の降順でソート
        .skip(skipAmount) // 指定した数だけスキップ
        .limit(limit)); // 上限数まで取得
        
      // 画像の総数を取得
      const totalImages = await Image.countDocuments(query);
      // 保存されている画像の数を取得
      const savedImages = await Image.find().countDocuments();

      // 結果を返す
      return {
            data: JSON.parse(JSON.stringify(images)), // 画像データ
            totalPage: Math.ceil(totalImages / limit), // 総ページ数
            savedImages, // 保存されている画像の数
      };  
     
    } catch (error) {
      // エラーハンドリング
      handleError(error)
    }
}

//Get User Images
export async function getUserImages({
    limit = 9,
    page = 1, 
    userId,
}: {
    limit?: number;
    page?: number;
    userId: string;
}) {
    try {
        await connectToDatabase();

        const skipAmount = (Number(page) -1) * limit;

        const images = await Image.find({ author: userId })
            .sort({ updatedAt: -1 })
            .skip(skipAmount)
            .limit(limit);

        const totalImages = await Image.find({ author: userId }).countDocuments();

        return {
            data: JSON.parse(JSON.stringify(images)),
            totalPage: Math.ceil(totalImages / limit),
        }
    } catch (error) {
        handleError(error)
    }
}
