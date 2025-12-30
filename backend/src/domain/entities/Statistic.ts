export class Statistic {
  constructor(
    public urlCode: string,
    public ip: string,
    public userAgent: string | undefined,
    public createdAt: Date = new Date()
  ) { }
}

