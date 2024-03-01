"use client"

import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { Input } from "@/components/ui/input";
import { formUrlQuery, removeKeysFromQuery } from "@/lib/utils";

export const Search = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [query, setQuery] = useState("");

    useEffect(() => {
        // デバウンスのためにタイムアウトを設定
        const delayDebounceFn = setTimeout(() => {
            // クエリが存在する場合
            if(query){
                // 検索パラメータを更新して新しいURLを生成
                const newUrl = formUrlQuery({
                    searchParams: searchParams.toString(),
                    key: "query",
                    value: query,
                })
                
                // 新しいURLに遷移（スクロールは無効）
                router.push(newUrl, { scroll: false });
            } else {
                // クエリが存在しない場合、"query"キーを削除して新しいURLを生成
                const newUrl = removeKeysFromQuery({
                    searchParams: searchParams.toString(),
                    keysToRemove: ["query"],
                })
    
                // 新しいURLに遷移（スクロールは無効）
                router.push(newUrl, { scroll: false });
            }
        }, 300); // 500ミリ秒の遅延
    
        // コンポーネントがアンマウントされるときにタイムアウトをクリア
        return () => clearTimeout(delayDebounceFn);
    }, [query, router, searchParams]); // query、router、searchParamsが変更されたときに効果を再実行

    return (
        <div className="search">
            <Image
                src="/assets/icons/search.svg"
                alt="Search"
                width={24}
                height={24} 
            />

            <Input
                className="search-field"
                placeholder="Search"
                onChange={(e) => setQuery(e.target.value)}
            />
        </div>
    )
}