enum ChannelType {
    IN_APP,
    EMAIL,
}


// BẮT ĐẦU COPY ĐỂ CHATGPT TỪ ĐÂY
abstract class NotificationChannelAbstract {
    abstract sendNotification(recipient: string, message: string): Promise<void>;
    abstract getChannelType(): ChannelType;
}


export class EmailNotificationChannel extends NotificationChannelAbstract {
    constructor() {
        super();
        //logic viết sau
    }
    async sendNotification(recipient: string, message: string): Promise<void> {
        //logic viết sau
    }
    getChannelType(): ChannelType {
        return ChannelType.EMAIL;
    }
}


export class FirebaseInappNotificationChannel extends NotificationChannelAbstract {
    constructor() {
        super();
        //logic viết sau
    }
    async sendNotification(recipient: string, message: string): Promise<void> {
        //logic viết sau
    }
    getChannelType(): ChannelType {
        return ChannelType.IN_APP;
    }
}


export class NotificationListener {
    private static instance: NotificationListener;
    private channels: NotificationChannelAbstract[] = [];

    private constructor() {}

    public static getInstance(): NotificationListener {
        if (!NotificationListener.instance) {
            NotificationListener.instance = new NotificationListener();
        }
        return NotificationListener.instance;
    }

    registerChannel(channel: NotificationChannelAbstract) {
        const isAlreadyRegistered = this.channels.some(
            c => c.getChannelType() === channel.getChannelType()
        );
        if (!isAlreadyRegistered) {
            this.channels.push(channel);
        }
    }

    /**
     * Gửi thông báo đến TẤT CẢ các kênh đã đăng ký.
     */
    async notifyAll(recipient: string, message: string) {
        const promises = this.channels.map(channel =>
            channel.sendNotification(recipient, message)
        );
        await Promise.all(promises);
    }

    async notifyChannel(recipient: string, message: string, channelType: ChannelType): Promise<void> {
        const targetChannel = this.channels.find(
            channel => channel.getChannelType() === channelType
        );

        if (targetChannel) {
            await targetChannel.sendNotification(recipient, message);
        } else {
            // Nếu không tìm thấy, có thể báo lỗi hoặc bỏ qua
        }
    }
}