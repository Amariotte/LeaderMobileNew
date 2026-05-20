export type errorApi = {
  type: string;
  title: string;  
  detail: string;
  instance: string;
  status: number;
  InvalidParams: invalidParams[];
}

export type invalidParams = {
  name: string;
  reason: string;  
}



