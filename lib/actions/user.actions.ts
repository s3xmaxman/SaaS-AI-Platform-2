"use server";

import { revalidatePath } from "next/cache";

import User from "../database/models/user.model";
import { connectToDatabase } from "../database/mongoose";
import { handleError } from "../utils";

// ユーザー作成
export async function createUser(user: CreateUserParams) {
  try {
    await connectToDatabase();  // データベースへ接続

    const newUser = await User.create(user); // 新規ユーザー作成

    return JSON.parse(JSON.stringify(newUser)); // 新規ユーザーのデータを返す
  } catch (error) {
    handleError(error); // エラーハンドリング
  }
}

// ユーザー取得
export async function getUserById(userId: string) {
  try {
    await connectToDatabase(); // データベースへ接続

    const user = await User.findOne({ clerkId: userId }); // ユーザーIDで検索

    if (!user) throw new Error("User not found"); // ユーザーが見つからない場合のエラー

    return JSON.parse(JSON.stringify(user)); // ユーザーデータを返す
  } catch (error) {
    handleError(error); 
  }
}

// ユーザー更新
export async function updateUser(clerkId: string, user: UpdateUserParams) {
  try {
    await connectToDatabase(); // データベースへ接続

    const updatedUser = await User.findOneAndUpdate({ clerkId }, user, {
      new: true,
    }); // ユーザー情報の更新

    if (!updatedUser) throw new Error("User update failed"); // 更新失敗時のエラー
    
    return JSON.parse(JSON.stringify(updatedUser)); // 更新後のユーザーデータを返す
  } catch (error) {
    handleError(error);
  }
}

// ユーザー削除
export async function deleteUser(clerkId: string) {
  try {
    await connectToDatabase(); // データベースへ接続

    const userToDelete = await User.findOne({ clerkId }); // 削除するユーザーを検索

    if (!userToDelete) throw new Error("User not found"); // ユーザーが見つからない場合のエラー

    const deletedUser = await User.findByIdAndDelete(userToDelete._id); // ユーザーの削除
    revalidatePath("/"); // パスの再検証

    return deletedUser ? JSON.parse(JSON.stringify(deletedUser)) : null; // 削除したユーザーのデータを返す
  } catch (error) {
    handleError(error); 
  }
}

// クレジットの使用
export async function updateCredits(userId: string, creditFee: number) {
  try {
    await connectToDatabase(); // データベースへ接続

    const updatedUserCredits = await User.findOneAndUpdate(
      { _id: userId },
      { $inc: { creditBalance: creditFee }},
      { new: true }
    ); // クレジットの更新

    if(!updatedUserCredits) throw new Error("User credits update failed"); // 更新失敗時のエラー

    return JSON.parse(JSON.stringify(updatedUserCredits)); // 更新後のクレジット情報を返す
  } catch (error) {
    handleError(error); 
  }
}

