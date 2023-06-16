###### tags: `aiwings` `vue`

# 修改紀錄

## 效率提升

- 解決每次只要進行與資料庫有關的動作時，就會執行多餘的創建表格的動作
  
  - 方法：把創建表格的程式碼從connectToDatabase()中提出另外創建成creatTable()

  - 後端`./src/services/database.ts`中新增一個 creatTable()

    ```js
    export async function creatTable() {
        console.log("創建表格")
        let db = await connectToDatabase(); // 先連線資料庫
        
        //創建 user 表格 程式碼
        //創建 drones 表格 程式碼
        
    }
    ```

  - 後端`./src/services/server.ts`的 connectToDatabase() 改成 creatTable()

## 資料庫連線顯示問題

- 解決即使提供錯誤連線密碼，或者錯誤port，都仍舊顯示"Connect to database successfully!"的問題
  - 方法：利用db.connect((err:any)=>{})
    ![img](https://hackmd-prod-images.s3-ap-northeast-1.amazonaws.com/uploads/upload_c07ffdf0baf50dde84f033e225fcdcf1.png?AWSAccessKeyId=AKIA3XSAAW6AWSKNINWO&Expires=1686891669&Signature=p6zyHY%2B4dUiqJ2WfH3SNUSDbnu0%3D)

## 大量註解說明
