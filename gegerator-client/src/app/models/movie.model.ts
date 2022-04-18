import { Duration } from "iso8601-duration";

export interface Movie{
  id: number;
  title: string;
  duration: Duration;
}
