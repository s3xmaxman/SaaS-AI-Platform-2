
import mongoose, { Mongoose} from "mongoose";


const MONGODB_URL = process.env.MONGODB_URL;

// Mongooseの接続情報を持つインターフェース
interface MongooseConnection {
    conn: Mongoose | null; // 接続オブジェクト
    promise: Promise<Mongoose> | null; // 接続プロミス
}

// グローバル変数からキャッシュされた接続情報を取得
let cached: MongooseConnection = ( global as any ).mongoose 

// キャッシュが存在しない場合は新たに作成
if(!cached){
    cached = ( global as any ).mongoose = { conn: null, promise: null }
}

// MongoDBへの接続関数
export const connectionToMongoDB = async () => {
    // 既に接続が存在する場合はそれを返す
    if(cached.conn) return cached.conn

    // MongoDBのURLが存在しない場合はエラーを投げる
    if(!MONGODB_URL) throw new Error("Missing MONGODB_URL")

    // 接続プロミスが存在しない場合は新たに作成
    cached.promise = 
    cached.promise || 
    mongoose.connect(MONGODB_URL,{
        dbName: "imaginify", // データベース名
        bufferCommands: false, // コマンドバッファリングを無効化
    })

    // 接続プロミスを待機
    cached.conn = await cached.promise

    // 接続オブジェクトを返す
    return cached.conn;
}
