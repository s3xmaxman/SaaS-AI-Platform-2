export const navLinks = [
    {
      label: "ホーム",
      route: "/",
      icon: "/assets/icons/home.svg",
    },
    {
      label: "イメージ修復",
      route: "/transformations/add/restore",
      icon: "/assets/icons/image.svg",
    },
    {
      label: "ジェネレーティブ塗りつぶし",
      route: "/transformations/add/fill",
      icon: "/assets/icons/stars.svg",
    },
    {
      label: "オブジェクト除去",
      route: "/transformations/add/remove",
      icon: "/assets/icons/scan.svg",
    },
    {
      label: "オブジェクトのカラー変換",
      route: "/transformations/add/recolor",
      icon: "/assets/icons/filter.svg",
    },
    {
      label: "背景除去",
      route: "/transformations/add/removeBackground",
      icon: "/assets/icons/camera.svg",
    },
    {
      label: "プロフィール",
      route: "/profile",
      icon: "/assets/icons/profile.svg",
    },
    {
      label: "クレジットを購入",
      route: "/credits",
      icon: "/assets/icons/bag.svg",
    },
  ];
  
  export const plans = [
    {
      _id: 1,
      name: "フリープラン",
      icon: "/assets/icons/free-plan.svg",
      price: 0,
      credits: 20,
      inclusions: [
        {
          label: "無料の２０クレジット",
          isIncluded: true,
        },
        {
          label: "サービスへの基本的なアクセス",
          isIncluded: true,
        },
        {
          label: "優先的なサポート",
          isIncluded: false,
        },
        {
          label: "優先的なアップデート",
          isIncluded: false,
        },
      ],
    },
    {
      _id: 2,
      name: "プロプラン",
      icon: "/assets/icons/free-plan.svg",
      price: 40,
      credits: 120,
      inclusions: [
        {
          label: "120 クレジット",
          isIncluded: true,
        },
        {
          label: "サービスへの完全アクセス",
          isIncluded: true,
        },
        {
          label: "優先的カスタマーサポート",
          isIncluded: true,
        },
        {
          label: "優先的なアップデート",
          isIncluded: false,
        },
      ],
    },
    {
      _id: 3,
      name: "プレミアムプラン",
      icon: "/assets/icons/free-plan.svg",
      price: 199,
      credits: 2000,
      inclusions: [
        {
          label: "2,000 クレジット",
          isIncluded: true,
        },
        {
          label: "完全なサービスへのアクセス",
          isIncluded: true,
        },
        {
          label: "優先的なカスタマーサポート",
          isIncluded: true,
        },
        {
          label: "優先的なアップデート",
          isIncluded: true,
        },
      ],
    },
  ];
  
  export const transformationTypes = {
    restore: {
      type: "restore",
      title: "Restore Image",
      subTitle: "Refine images by removing noise and imperfections",
      config: { restore: true },
      icon: "image.svg",
    },
    removeBackground: {
      type: "removeBackground",
      title: "Background Remove",
      subTitle: "Removes the background of the image using AI",
      config: { removeBackground: true },
      icon: "camera.svg",
    },
    fill: {
      type: "fill",
      title: "Generative Fill",
      subTitle: "Enhance an image's dimensions using AI outpainting",
      config: { fillBackground: true },
      icon: "stars.svg",
    },
    remove: {
      type: "remove",
      title: "Object Remove",
      subTitle: "Identify and eliminate objects from images",
      config: {
        remove: { prompt: "", removeShadow: true, multiple: true },
      },
      icon: "scan.svg",
    },
    recolor: {
      type: "recolor",
      title: "Object Recolor",
      subTitle: "Identify and recolor objects from the image",
      config: {
        recolor: { prompt: "", to: "", multiple: true },
      },
      icon: "filter.svg",
    },
  };
  
  export const aspectRatioOptions = {
    "1:1": {
      aspectRatio: "1:1",
      label: "Square (1:1)",
      width: 1000,
      height: 1000,
    },
    "3:4": {
      aspectRatio: "3:4",
      label: "Standard Portrait (3:4)",
      width: 1000,
      height: 1334,
    },
    "9:16": {
      aspectRatio: "9:16",
      label: "Phone Portrait (9:16)",
      width: 1000,
      height: 1778,
    },
  };
  
  export const defaultValues = {
    title: "",
    aspectRatio: "",
    color: "",
    prompt: "",
    publicId: "",
  };
  
  export const creditFee = -1;