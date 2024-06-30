import cv2

# 使用範例
video_path = r"C:\Users\AIOT\Desktop\DJI_0006.MP4"
target_width = 640  # 替換為您希望的寬度
target_height = 480  # 替換為您希望的高度
cap = cv2.VideoCapture(video_path)
fps = cap.get(cv2.CAP_PROP_FPS)


def get_frame_at_time(time_in_seconds):
    # 計算目標秒數所對應的影片幀數
    target_frame_number = int(time_in_seconds * fps)

    # 跳轉到目標幀數
    cap.set(cv2.CAP_PROP_POS_FRAMES, target_frame_number)

    # 讀取影片中的一幀
    ret, frame = cap.read()

    # 確保成功讀取影片幀
    if not ret:
        print("無法讀取影片幀")
        return None

    # 如果指定了目標寬度和高度，則重新調整影片幀大小
    if target_width and target_height:
        frame = cv2.resize(frame, (target_width, target_height))

    return frame


if __name__ == "__main__":
    for i in range(1000):
        frame_at_time = get_frame_at_time(i)

        if frame_at_time is not None:
            cv2.imshow("Video", frame_at_time)

            # 等待1000毫秒 (1秒)，如果按下'q'鍵或已顯示最後一張影片，則退出迴圈
            key = cv2.waitKey(1)
            if key & 0xFF == ord('q'):
                break
