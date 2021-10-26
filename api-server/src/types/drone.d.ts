type DroneRemoteAction =
  | 'ARM'
  | 'DISARM'
  | 'TAKEOFF'
  | 'LAND'
  | 'GOTO'
  | 'GUIDED'
  | 'RTL'
  | 'CHANGE_SPEED'
  | 'CHANGE_YAW'
  | 'SERVO_UP'
  | 'SERVO_DOWN'
  | 'SERVO_STOP'
  | 'GIMBAL_LEFT_RIGHT'
  | 'GIMBAL_FRONT_BACK';

export interface Command {
  cmd: DroneRemoteAction;
  altitude?: number;
  lng?: number;
  lat?: number;
  speed?: number;
  angle?: number;
  pwm?: number;
}
