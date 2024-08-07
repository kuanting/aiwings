import { Request, Response } from "express";
import { connectToDatabase as db, closeConnect, connectToDatabase } from "../services/database";
import { isDroneIdExistsByUuid, select_userEmail, select_userDroneIds_isAdmin, update_droneID, insert_droneIdForUser, delete_droneIdForUser } from "../services/database";
import { logger } from "../server";
import { AddIDPayload, EditIDPayload } from "../types";


const uploadFiles = (req: any, res: Response) => {
  console.log(req.body);
  console.log(req.files);
  res.json({ message: "Successfully uploaded files" });
}

let allUserVideoChunk: any[] = [];


export default {
  // /***************************************************
  //  * Offer user's `email` and `drone ID` to frontend
  // ***************************************************/
  // async loginUser(req: Request, res: Response) {
  //   console.log("------ [user.ts] ------ loginUser() ------\nres.locals = ", res.locals);
  //   // res.locals包含 uuid 和 accessToken 的值
  //   try {
  //     let conn: any = await db();
  //     //Promise
  //     const select_user = async function () {
  //       return new Promise(function (resolve, reject) {
  //         // console.log("uuid: ", res.locals.uuid);
  //         // let sql = " SELECT email,drone_id FROM user INNER JOIN drones WHERE user.id=UUID_TO_BIN(?);";
  //         let sql = " SELECT email FROM user  WHERE user.id=UUID_TO_BIN(?);";

  //         conn.query(sql, [res.locals.uuid], function (err: any, result: any) {
  //           if (err) {
  //             reject(err);
  //             return;
  //           }
  //           console.log("------ [user.ts] ------ loginUser() ------\nselect_user(): ", result);
  //           // handle object for userInfo
  //           type droneId = {
  //             [key: string]: any;
  //           };
  //           let drone: droneId = new Object();

  //           for (const index in result) {
  //             drone[index] = result[index].drone_id;
  //           }
  //           let userInfo = {
  //             email: result[0].email,
  //             droneId: drone,
  //           };
  //           let dataSTring = JSON.stringify(userInfo);
  //           let data = JSON.parse(dataSTring);
  //           resolve(data);
  //           return;
  //         });
  //       });
  //     };

  //     const user: any = await select_user();
  //     // console.log("user.ts: ", user);

  //     if (user) {
  //       res
  //         .cookie("access_token", res.locals.accessToken, {
  //           httpOnly: true,
  //           maxAge: 1000 * 60 * 5,
  //           sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
  //           secure: process.env.NODE_ENV === "production",
  //         })
  //         .json({
  //           email: user.email,
  //           droneId: user.droneId,
  //           isAdmin: user.isAdmin,
  //         });
  //     }
  //   } catch (error) {
  //     logger.error(error);
  //     res.status(500).json({ msg: "Internal server error" });
  //   }
  // },

  // login時只要select email，但accountform需要多搜尋droneID
  //  * 拆開來寫

  /***************************************************
   * Retrieve the user data requested by the client.
   * Including this user's email, all droneIDs, and drone's isAdmin
  ***************************************************/
  async getUserInfo(req: Request, res: Response) {
    console.log("------ [user.ts] ------ getUserInfo() ------");
    // `res.locals` contains the client's UUID and accessToken.

    try {
      let conn = await db();
      let userEmail = await select_userEmail(conn, res.locals.uuid)
      let userDroneIds_isAdmin = await select_userDroneIds_isAdmin(conn, res.locals.uuid)
      closeConnect(conn)

      // The reason for changing the property name is that the current frontend application retrieves values using `.id`.
      if (userDroneIds_isAdmin) {
        userDroneIds_isAdmin = userDroneIds_isAdmin.map((item: any) => {
          // Use destructuring assignment to rename the property 'drone_id' to 'id'
          const { drone_id: id, ...rest } = item;
          return { id, ...rest };
        });
      }

      let userInfo = {
        email: userEmail,
        droneId: userDroneIds_isAdmin,
        isAdmin: false
      };
      // console.log("userInfo = ", userInfo)

      // 每個droneId會有一個對應的isAdmin
      // 猜測可能是因為大學長寫的是單台無人機，所以將droneId和isAdmin分開無差
      // 變成多台無人機後，可能因為isAdmin暫時沒有影響，或者因為全都是0暫無差，所以依舊另外給isAdmin屬性
      // 為了配合格式以免影響前端，暫時保留userInfo的isAdmin屬性

      if (userInfo) {
        res
          .cookie("access_token", res.locals.accessToken, {
            httpOnly: true,
            maxAge: 1000 * 60 * 5,
            sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
            secure: process.env.NODE_ENV === "production",
          })
          .json({
            email: userInfo.email,
            droneId: userInfo.droneId,
            isAdmin: userInfo.isAdmin,
          });
      }
    } catch (error) {
      logger.error(error);
      res.status(500).json({ msg: "Internal server error" });
    }
  },

  /***************************************************
   * Edit user's `drone ID`
  ***************************************************/

  //FIXED ME
  async editUserDroneId(req: Request, res: Response) {
    console.log("------ [user.ts] ------ editUserDroneId() ------");
    const { droneId }: EditIDPayload = req.body;
    // console.log("更改後的droneId: ", req.body.droneId);
    // console.log("原始的ID: ':droneId' = ",req.params.droneId)
    // console.log("原本的droneId: ", req.body.originDroneId);
    // console.log("res.locals.uuid: ", res.locals.uuid)
    
    try {
      let conn = await db();
      /*Confirm if the changed DroneId exists.*/
      if (await isDroneIdExistsByUuid(conn, res.locals.uuid, req.body.droneId)) {
        console.log("This DroneId name already exists.")
        return res.json({ msg: "This Drone ID already exists!" });
      }

      /*Edit droneId name*/
      await update_droneID(conn, droneId, res.locals.uuid, req.params.droneId);
      closeConnect(conn)
      logger.info("Drone ID updated")
      res.json({ msg: "Drone ID updated" });
      
    } catch (error) {
      logger.error(error);
      res.status(500).json({ msg: "Internal server error" });
    }
  },

  /***************************************************
   * Add new drones for user
  ***************************************************/
  async addNewDrones(req: Request, res: Response) {
    console.log("------ [user.ts] ------ addNewDrone() ------",);
    const { droneId }: AddIDPayload = req.body;
    try {
      //MySQL
      let conn = await db();
      for (const index in droneId) {
        // if 'droneId[index]' is not exist
        if (await isDroneIdExistsByUuid(conn, res.locals.uuid, droneId[index]) == false) {
          await insert_droneIdForUser(conn, res.locals.uuid, droneId[index]); // Add this droneId for the user
        }
      }
      closeConnect(conn)
      logger.info("DroneIDs have been successfully added.")
      res.json({ msg: "Drone ID added!" });
    } catch (error) {
      logger.error(error);
      res.status(500).json({ msg: "Internal server error" });
    }
  },

  /***************************************************
   * Delete a drone from user
  ***************************************************/
  async deleteDrone(req: Request, res: Response) {
    console.log("------[user.ts] ------ deleteDrone() ------",);
    // const { droneId }: EditIDPayload = req.body;
    const droneId = req.params.droneId
    // console.log("要刪除的ID: ':droneId' = ",req.params.droneId)
    
    try {
      //MYSQL
      const conn = await db()
      await delete_droneIdForUser(conn, res.locals.uuid, droneId)
      closeConnect(conn)
      logger.info(`Drone ID "${droneId}" is delete`)
      res.json({ msg: `Drone ID "${droneId}" is delete` });

    } catch (error) {
      logger.error(error);
      res.status(500).json({ msg: "Internal server error" });
    }
  },

  // /***************************************************
  //  * Store video screenshots of front-end users
  // ***************************************************/
  saveDroneVideoBlob(req: any, res: Response) {
    console.log("------[user.ts] ------ saveDroneVideoBlob() ------");
    try {
      // 透過router.post("/user/saveDroneVideoBlob", upload.array("files"), user.uploadFiles);中的upload.array("files")，解析了前端傳送的formData中的Blob物件，所以後端可以直接透過req.files取得解析的資料，其他沒有解析的依舊要從req.body中取得，例如ormData中的test選項的內容，需要用req.body.test取得
      // console.log(req.files);
      // console.log(req.files[0].buffer);
      // console.log(req.body);

      const fileData = req.files[0].buffer  // 取得圖片的buffer
      const { userName, droneID, fileName } = req.body // 解構賦值寫法


      const fs = require('fs');
      /**** 確保文件夾存在，如果不存在就創建 ****/
      if (!fs.existsSync('./uploads/')) fs.mkdirSync('./uploads/');

      // 【建立此用戶專用資料夾】
      const user_Folder = `./uploads/${userName}`;
      if (!fs.existsSync(user_Folder)) fs.mkdirSync(user_Folder);
      // 【建立此用戶的個別droneID專用資料夾】
      const user_uploadFolder = user_Folder + `/${droneID}`;
      if (!fs.existsSync(user_uploadFolder)) fs.mkdirSync(user_uploadFolder);

      /********** 儲存檔案到資料夾中 **********/
      const filePath = user_uploadFolder + `/${fileName}`; // 要寫入的檔案路徑
      fs.writeFile(filePath, fileData, (err: any) => {
        if (err) {
          logger.error('Error writing file:', err);
          res.status(400).json({ msg: "Error writing file" });
        } else {
          logger.info('File is successfully saved');
          res.json({ msg: "Successfully uploaded files" });
        }
      });

    } catch (error) {
      logger.error(error);
      res.status(500).json({ msg: "Internal server error" });
    }
  },

  // /***************************************************
  //  * 分段接收(還在測試)
  // ***************************************************/
  //   test(req: any, res: Response) {
  //     console.log("======== test ====================")
  //     try {
  //       const buffer = req.files[0].buffer//這是要寫入的文字內容。';
  //       const {userName, droneID, fileName, isEND} = req.body // 解構賦值寫法

  //       allUserVideoChunk.push(buffer)
  //       console.log(allUserVideoChunk)

  //       console.log(" if(isEND) = ",isEND)
  //       if(isEND=="true"){
  //         // const fileData = new Blob(allUserVideoChunk, { type: "text/plain" });

  //         const fs = require('fs');
  //         // 確保文件夾存在，如果不存在就創建【建立用戶專用資料夾】
  //         const user_Folder = `./uploads/${userName}`;
  //         if (!fs.existsSync(user_Folder)) {
  //           fs.mkdirSync(user_Folder);
  //         }

  //         // 確保文件夾存在，如果不存在就創建【建立用戶的個別droneID專用資料夾】
  //         const user_uploadFolder = user_Folder+`/${droneID}`; //
  //         if (!fs.existsSync(user_uploadFolder)) {
  //           fs.mkdirSync(user_uploadFolder);
  //         }

  //         const writeStreamTTT = fs.createWriteStream(user_uploadFolder+'/output.txt');
  //         writeStreamTTT.write('你好，');
  //         writeStreamTTT.write('世界！');

  //         writeStreamTTT.end();

  //         writeStreamTTT.on('finish', () => {
  //           console.log('寫入操作已完成');
  //         });

  //       //   // 儲存檔案到資料夾中
  //       //   const filePath = user_uploadFolder+`/${fileName}`; // 要寫入的檔案路徑
  //       //   // 創建一個可寫串流
  //       //   const writeStream = fs.createWriteStream(filePath); // 使用 'a' 以附加模式打開檔案

  //       //   const combinedBuffer = Buffer.concat([allUserVideoChunk[0], allUserVideoChunk[0]]);
  //       //   console.log(">>",combinedBuffer)

  //       //   // 寫入第一個 Buffer
  //       //   writeStreamTTT.write(combinedBuffer);

  //       //   // // 寫入第二個 Buffer
  //       //   // writeStream.write(allUserVideoChunk[0]);

  //       //   // 結束寫入
  //       //   writeStreamTTT.end();

  //       //   // 監聽串流結束事件
  //       //   writeStreamTTT.once('open', () => {
  //       //     console.log('流打開了');
  //       //   });

  //       //   // 監聽串流錯誤事件
  //       //   writeStreamTTT.once('close', () => {
  //       //     console.error("流關閉了");
  //       //   });

  //       //   writeStreamTTT.on('finish', () => {
  //       //     console.log('All writes are now complete.');
  //       //   });
  //       //   // 監聽串流錯誤事件
  //       //   writeStreamTTT.on('error', (err:any) => {
  //       //     console.error('Error writing file:', err);
  //       //   });

  //       //   // fs.writeFile(filePath, allUserVideoChunk, (err:any) => {
  //       //   //   console.log("isEND = ",isEND)

  //       //   //   if (err) {
  //       //   //     logger.error('Error writing file:', err);
  //       //   //     res.status(400).json({ msg: "Error writing file" });
  //       //   //   } else {
  //       //   //     logger.info('File is successfully saved');
  //       //   //     res.json({ msg: "Successfully uploaded files" });
  //       //   //   }
  //       //   // });
  //       //   // res.json({ msg: "Successfully uploaded files" });
  //       // }
  //       // res.json({ msg: "OK !" });
  //       }
  //     }
  //     catch(error){
  //       logger.error(error);
  //       res.status(500).json({ msg: "Internal server error" });
  //     }

  //   }

};

// // =============================================================
// function removeFromArray(arr:Array<any>, item:any) {
//   const index = arr.indexOf(item);
//   if (index !== -1) {
//     arr.splice(index, 1);
//   }
// }


// function Add(arr:Array<any>, item:any, add:any) {
//   const index = arr.indexOf(item);
//   if (index !== -1) {
//     arr[index].push(add)
//   }
// }
