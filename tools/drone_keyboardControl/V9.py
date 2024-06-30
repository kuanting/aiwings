"""
Simple script for take off and control with arrow keys
"""

import time
from pymavlink import mavutil
import pandas as pd
import tkinter as tk
from tkinter import font
from tkinter import ttk
import dji
import time
from pymavlink import mavutil
import tkinter as tk
from tkinter import font
from tkinter import ttk
import video
import cv2
import threading

mavutil.set_dialect("ardupilotmega")
root = tk.Tk()
root.geometry("800x400")  # Size of the window
root.title("SITL Controller")  # Adding a title
labelfont = font.Font(family="microsoft yahe", size=12, weight=font.BOLD)
labelword = ["Q", "W", "E", "A", "S", "D", "UP", "DOWN", "M", "Alarm"]
labellist = []


class DroneController:
    def __init__(self):
        self.vehicle = None
        self.relay_status = 0
        self.servo_pwm = 2500
        self.drone_id = 0
        self.altitude = 2
        self.current_mode = 9
        self.current_arm = 0
        self.yaw = 0

    def connect1(self):
        # -- Connect to the vehicle
        print('Connecting...')
        # self.vehicle = mavutil.mavlink_connection('tcp:127.0.0.1:5763', )
        self.vehicle = mavutil.mavlink_connection(str(com_box.get()), baud=57600)
        print('Connecting OK')

    def connect2(self):
        # -- Connect to the vehicle
        print('Connecting...')
        self.vehicle = mavutil.mavlink_connection('tcp:127.0.0.1:5763', )
        # self.vehicle = mavutil.mavlink_connection(str(com_box.get()), baud=57600)
        print('Connecting OK')

    def status(self):
        return [self.altitude, self.relay_status, self.servo_pwm]

    def arm_and_takeoff(self, altitude):
        # Arm the motors
        print("Arming motors")
        self.arm(0, 1)
        # Wait for the vehicle to be armed
        while True:
            msg = self.vehicle.recv_match(type='HEARTBEAT', blocking=True)
            if msg.get_type() == 'HEARTBEAT' and msg.base_mode == 217:
                self.current_arm = 1
                print("break")
                break
            else:
                print("Waiting for vehicle to be armed")
                time.sleep(1)

        # Take off to the specified altitude
        # time.sleep(5)
        self.takeoff(0, altitude)

    def arm(self, drone_id, arm_status):
        msg = mavutil.mavlink.MAVLink_command_long_message(
            0,  # target system ID
            0,  # target component ID
            mavutil.mavlink.MAV_CMD_COMPONENT_ARM_DISARM,  # command
            0,  # confirmation
            arm_status,  # arm
            0, 0, 0, 0, 0, 0  # unused parameters
        )
        self.vehicle.mav.send(msg)

    def takeoff(self, drone_id, altitude):
        print("takeoff")
        msg = mavutil.mavlink.MAVLink_command_long_message(
            0,  # target system ID
            0,  # target component ID
            mavutil.mavlink.MAV_CMD_NAV_TAKEOFF,  # command
            0,  # confirmation
            0, 0, 0, 0,  # unused parameters
            0, 0, altitude  # parameters 5-8
        )
        self.vehicle.mav.send(msg)

    def set_velocity_body(self, drone_id, vx, vy, vz):
        msg = self.vehicle.mav.set_position_target_local_ned_encode(
            0,
            0, 0,
            mavutil.mavlink.MAV_FRAME_BODY_OFFSET_NED,
            0b100111000111,
            0, 0, 0,
            vx, vy, vz,
            0, 0, 0,
            0, 0
        )
        self.vehicle.mav.send(msg)

    def condition_yaw(self, drone_id, heading, relative, direction):
        print(heading, relative, direction)
        if relative:
            is_relative = 1
        else:
            is_relative = 0
        msg = mavutil.mavlink.MAVLink_command_long_message(
            0, 0,
            mavutil.mavlink.MAV_CMD_CONDITION_YAW,
            0,
            heading,
            0,  # yaw speed
            direction,  # direction -1 ccw, 1 cw
            is_relative,  # relative offset
            0, 0, 0
        )
        self.vehicle.mav.send(msg)

    def relay(self, drone_id, num, status):
        msg = mavutil.mavlink.MAVLink_command_long_message(
            0, 0,  # target system, target component
            mavutil.mavlink.MAV_CMD_DO_SET_RELAY,  # command
            0,  # confirmation
            num,  # param 1, relay number
            status,  # param 2, relay status
            0, 0, 0, 0, 0)  # unused parameters
        # send command to vehicle
        self.vehicle.mav.send(msg)

    def servo(self, drone_id, num, pwm):
        # Create a MAVLink message to set a servo
        msg = mavutil.mavlink.MAVLink_command_long_message(
            0,  # target_system
            0,  # target_component
            mavutil.mavlink.MAV_CMD_DO_SET_SERVO,  # command
            0,  # confirmation
            num,  # servo number
            pwm,  # PWM value
            0, 0, 0, 0, 0)  # unused parameters
        # send the MAVLink message
        self.vehicle.mav.send(msg)

    def mode(self, drone_id, custom_mode):
        msg = mavutil.mavlink.MAVLink_command_long_message(
            0,  # target_system
            0,  # target_component
            mavutil.mavlink.MAV_CMD_DO_SET_MODE,  # command
            0,  # confirmation
            1,  # param1
            custom_mode,  # param2
            0, 0, 0, 0, 0)  # unused parameters
        # Send the MAVLink message
        self.vehicle.mav.send(msg)

    def goto(self, lat, lon, alt):
        print("GOTO")
        msg = self.vehicle.mav.mission_item_encode(
            0, 0,  # target system, target component
            0,  # seq
            mavutil.mavlink.MAV_FRAME_GLOBAL_RELATIVE_ALT,  # frame
            mavutil.mavlink.MAV_CMD_NAV_WAYPOINT,  # command
            2,  # current
            1,  # autocontinue
            0, 0, 0, 50,  # param 1~4
            lat, lon, alt
        )
        self.vehicle.mav.send(msg)

    def req_message(self):
        msg = mavutil.mavlink.MAVLink_command_long_message(
            0,  # target_system
            0,  # target_component
            511,  # command MAV_CMD_SET_MESSAGE_INTERVAL
            0,  # confirmation
            30,  # desired MAVLink message’s id - 31 = ATTITUDE_QUATERNION
            1000000,  # time interval between messages in microseconds
            0, 0, 0, 0, 0)  # param 3-7 not used
        self.vehicle.mav.send(msg)

    def on_message(self):
        msg = self.vehicle.recv_match(type='ATTITUDE', blocking=True)
        print(msg.yaw * 180 / 3.14)
        if msg.yaw * 180 / 3.14 >= 0:
            return msg.yaw * 180 / 3.14
        if msg.yaw * 180 / 3.14 < 0:
            return msg.yaw * 180 / 3.14 + 360

# -- Key event function
def key(event):
    root.focus()
    id = int(list({box.current()})[0])
    global relay_status
    gnd_speed = 2  # [m/s]

    if event.char == event.keysym:  # -- standard keys
        if event.keysym == 'w' or event.keysym == 'W':
            print("往前")
            dronelist[com_box.current()].set_velocity_body(id, gnd_speed, 0, 0)
            dronelist[20].set_velocity_body(id, gnd_speed, 0, 0)
            labellist[20].config(bg="firebrick4")
        elif event.keysym == 's' or event.keysym == 'S':
            dronelist[com_box.current()].set_velocity_body(id, -gnd_speed, 0, 0)
            dronelist[20].set_velocity_body(id, -gnd_speed, 0, 0)

            print("往後")
            labellist[4].config(bg="firebrick4")
        elif event.keysym == 'a' or event.keysym == 'A':
            dronelist[com_box.current()].set_velocity_body(id, 0, -gnd_speed, 0)
            dronelist[20].set_velocity_body(id, 0, -gnd_speed, 0)

            print("往左")
            labellist[3].config(bg="firebrick4")
        elif event.keysym == 'd' or event.keysym == 'D':
            dronelist[com_box.current()].set_velocity_body(id, 0, gnd_speed, 0)
            dronelist[20].set_velocity_body(id, 0, gnd_speed, 0)
            print("往右")
            labellist[5].config(bg="firebrick4")
        elif event.keysym == 'q' or event.keysym == 'Q':
            dronelist[com_box.current()].condition_yaw(id, 10, True, -1)
            dronelist[20].condition_yaw(id, 10, True, -1)
            print("Yaw往左")
            labellist[0].config(bg="firebrick4")
        elif event.keysym == 'e' or event.keysym == 'E':
            dronelist[com_box.current()].condition_yaw(id, 10, True, 1)
            dronelist[20].condition_yaw(id, 10, True, 1)
            print("Yaw往右")
            labellist[2].config(bg="firebrick4")
        elif event.keysym == 'm' or event.keysym == 'M':
            if dronelist[com_box.current()].current_mode == 9:
                dronelist[com_box.current()].mode(id, 4)
                dronelist[com_box.current()].current_mode = 4
                dronelist[20].mode(id, 4)
                dronelist[20].current_mode = 4
            else:
                dronelist[com_box.current()].mode(id, 9)
                dronelist[com_box.current()].current_mode = 9
                dronelist[20].mode(id, 9)
                dronelist[20].current_mode = 9
            labellist[8].config(bg="firebrick4")
        elif event.keysym == '1':
            if dronelist[com_box.current()].relay_status == 0:
                dronelist[com_box.current()].relay_status = 1
                dronelist[com_box.current()].relay(id, 0, dronelist[com_box.current()].relay_status)
            else:
                dronelist[com_box.current()].relay_status = 0
                dronelist[com_box.current()].relay(id, 0, dronelist[com_box.current()].relay_status)
        elif event.keysym == '8':
            dronelist[com_box.current()].servo_pwm += 30
            if dronelist[com_box.current()].servo_pwm >= 2500:
                dronelist[com_box.current()].servo_pwm = 2500
            dronelist[com_box.current()].servo(id, 9, dronelist[com_box.current()].servo_pwm)
        elif event.keysym == '2':
            dronelist[com_box.current()].servo_pwm -= 30
            if dronelist[com_box.current()].servo_pwm <= 500:
                dronelist[com_box.current()].servo_pwm = 500
            dronelist[com_box.current()].servo(id, 9, dronelist[com_box.current()].servo_pwm)
        elif event.keysym == '3':
            index_size = df.shape[0]
            for i in range(index_size):
                print(i, df.iloc[i][3], df.iloc[i][4], df.iloc[i][5], df.iloc[i][6], df.iloc[i][22])
                dronelist[com_box.current()].goto(df.iloc[i][4], df.iloc[i][5], df.iloc[i][6])
                dronelist[com_box.current()].req_message()
                current_yaw = dronelist[com_box.current()].on_message()
                print(current_yaw, df.iloc[i][22])
                yaw_diff = current_yaw - df.iloc[i][22]
                if yaw_diff > 20 or yaw_diff < -20:
                    if yaw_diff > 0:
                        dronelist[com_box.current()].condition_yaw(id, df.iloc[i][22], False, -1)
                    else:
                        dronelist[com_box.current()].condition_yaw(id, df.iloc[i][22], False, 1)
                    dronelist[com_box.current()].yaw = df.iloc[i][22]
                    while True:
                        print("yaw not ready yet")
                        current_yaw = dronelist[com_box.current()].on_message()
                        yaw_diff = current_yaw - df.iloc[i][22]
                        print(current_yaw, yaw_diff)
                        if 10 > yaw_diff > -10 or df.iloc[i][6] < 1:
                            break
                frame_at_time = video.get_frame_at_time(i * 0.1)
                if frame_at_time is not None:
                    cv2.imshow("Video", frame_at_time)
                    # 等待1毫秒，如果按下'q'鍵或已顯示最後一張影片，則退出迴圈
                    key = cv2.waitKey(1)
                    if key & 0xFF == ord('q'):
                        break
    else:  # -- non standard keys
        if event.keysym == 'Up':
            dronelist[com_box.current()].set_velocity_body(id, 0, 0, -gnd_speed)
            dronelist[21].set_velocity_body(id, 0, 0, -gnd_speed)
            print("往上")
            labellist[6].config(bg="firebrick4")
        elif event.keysym == 'Down':
            dronelist[com_box.current()].set_velocity_body(id, 0, 0, gnd_speed)
            dronelist[21].set_velocity_body(id, 0, 0, gnd_speed)
            print("往下")
            labellist[7].config(bg="firebrick4")


def KeyRelease(event):
    for word in range(len(labelword)):
        labellist[word].config(bg="black")


for i in range(len(labelword)):
    labellist.append(tk.Label(root,  # 文字標示所在視窗
                              text=labelword[i],  # 顯示文字
                              bg='black',  # 背景顏色
                              font=labelfont,  # 字型與大小
                              fg="white",
                              width=15, height=2)  # 文字標示尺寸
                     )

box = ttk.Combobox(root,
                   width=15,
                   values=['All Drone', 'Drone_001', 'Drone_002', 'Drone_003', 'Drone_004', 'Drone_005'],
                   state='readonly')
com_box = ttk.Combobox(root,
                       width=15,
                       values=['COM1', 'COM2', 'COM3', 'COM4', 'COM5', 'COM6', 'COM7', 'COM8', 'COM9',
                               'COM10', 'COM11', 'COM12', 'COM13', 'COM14', 'COM15', 'COM16', 'COM17', 'COM18', 'COM19',
                               'COM20'],
                       state='readonly')


def run_command_non_blocking(command):
    # 在新線程中執行command，避免卡住GUI
    thread = threading.Thread(target=command)
    thread.start()


def takeoff_button_callback():
    dronelist[com_box.current()].mode(0, 4)
    dronelist[com_box.current()].current_mode = 4
    dronelist[com_box.current()].arm_and_takeoff(2)
    dronelist[20].mode(0, 4)
    dronelist[20].current_mode = 4
    dronelist[20].arm_and_takeoff(2)


def connect_button1_callback():
    dronelist[com_box.current()].connect1()


def connect_button2_callback():
    dronelist[20].connect2()


takeoff_button = tk.Button(root, text="Takeoff", command=lambda: run_command_non_blocking(takeoff_button_callback))
connect_button1 = tk.Button(root, text="Connect to Drone",
                            command=lambda: run_command_non_blocking(connect_button1_callback))
connect_button2 = tk.Button(root, text="Connect to Airsim",
                            command=lambda: run_command_non_blocking(connect_button2_callback))

mode_label = tk.Label(root,  # 文字標示所在視窗
                      text="",  # 顯示文字
                      bg="purple",  # 背景顏色
                      font=labelfont,  # 字型與大小
                      fg="white",
                      width=15, height=2)  # 文字標示尺寸

armde_label = tk.Label(root,  # 文字標示所在視窗
                       text="",  # 顯示文字
                       bg="purple",  # 背景顏色
                       font=labelfont,  # 字型與大小
                       fg="white",
                       width=15, height=2)  # 文字標示尺寸

attitude_label = tk.Label(root,  # 文字標示所在視窗
                          text="",  # 顯示文字
                          bg="purple",  # 背景顏色
                          font=labelfont,  # 字型與大小
                          fg="white",
                          width=15, height=2)  # 文字標示尺寸

alarm_label = tk.Label(root,  # 文字標示所在視窗
                       text="",  # 顯示文字
                       bg="white",  # 背景顏色
                       font=labelfont,  # 字型與大小
                       fg="red",
                       width=15, height=2)  # 文字標示尺寸

servo_label = tk.Label(root,  # 文字標示所在視窗
                       text="",  # 顯示文字
                       bg="purple",  # 背景顏色
                       font=labelfont,  # 字型與大小
                       fg="white",
                       width=15, height=2)  # 文字標示尺寸


def show_mode():
    mode_label.config(text="Mode : " + str(dronelist[com_box.current()].current_mode))
    root.after(1000, show_mode)  # 視窗每隔 1000 毫秒再次執行一次 showmode()


def show_armed():
    armde_label.config(text="Armed : " + str(dronelist[com_box.current()].current_arm))
    root.after(1000, show_armed)  # 視窗每隔 1000 毫秒再次執行一次 showarmde()


def show_alarm():
    if dronelist[com_box.current()].relay_status == 0:
        alarm_status = "LOW"
    else:
        alarm_status = "HIGH"
    alarm_label.config(text="Alarm : " + alarm_status)
    root.after(1000, show_alarm)  # 視窗每隔 1000 毫秒再次執行一次 show_alarm()


def show_servo():
    servo_label.config(text="Servo angle : " + str(int(dronelist[com_box.current()].servo_pwm * 180 / 2000 - 135)))
    root.after(1000, show_servo)  # 視窗每隔 1000 毫秒再次執行一次 show_servo()


if __name__ == "__main__":
    dronelist = []
    for i in range(20):
        dronelist.append("COM" + str(i + 1))
        dronelist[i] = DroneController()
    dronelist.append("AirSim")
    dronelist[20] = DroneController()
    # 排版
    df = dji.read_csv_file(r"\Users\AIOT\Desktop\DJI.csv")

    show_mode()
    show_armed()
    show_alarm()
    show_servo()

    mode_label.grid(row=2, column=0)
    armde_label.grid(row=3, column=0)
    alarm_label.grid(row=4, column=0)
    box.grid(row=3, column=3)
    servo_label.grid(row=2, column=1)
    labellist[0].grid(row=0, column=0, padx=10, pady=30)
    labellist[1].grid(row=0, column=1, padx=10, pady=30)
    labellist[2].grid(row=0, column=2, padx=10, pady=30)
    labellist[6].grid(row=0, column=3, padx=90, pady=30)
    labellist[3].grid(row=1, column=0, padx=0, pady=10)
    labellist[4].grid(row=1, column=1, padx=10, pady=10)
    labellist[5].grid(row=1, column=2, padx=10, pady=10)
    labellist[7].grid(row=1, column=3, padx=90, pady=10)
    labellist[8].grid(row=2, column=3, padx=90)
    com_box.grid(row=3, column=3, pady=10)
    box.grid(row=4, column=3, pady=10)
    connect_button1.grid(row=5, column=3)
    connect_button2.grid(row=6, column=3)
    takeoff_button.grid(row=7, column=3)
    root.bind_all('<Key>', key)
    root.bind_all('<KeyRelease>', KeyRelease)
    root.mainloop()
