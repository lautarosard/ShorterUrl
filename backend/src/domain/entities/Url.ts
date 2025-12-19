export class Url {
    constructor(
        public originalUrl: string, // ¡Esto crea la propiedad y la asigna!
        public shortCode: string,
        public clicks: number = 0,
        public createdAt: Date = new Date()
    ) {}
}