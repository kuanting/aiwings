import pandas as pd


def read_csv_file(file_path):
    try:
        # 使用pandas讀取CSV檔案
        df = pd.read_csv(file_path)
        return df
    except FileNotFoundError:
        print("找不到指定的檔案！")
    except Exception as e:
        print("發生錯誤：", e)
        return None


if __name__ == "__main__":
    csv_file_path = "DJI.csv"
    df = read_csv_file(csv_file_path)

    if df is not None:
        # 列印讀取到的CSV資料
        print(df)
        print('------------')
        print(df.iloc[0])
        print(df.iloc[0][4])
        print(df.iloc[0][5])
        print(df.iloc[0][6])
