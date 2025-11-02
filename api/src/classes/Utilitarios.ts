import * as crypto from 'crypto';

export default class Utilitarios {

    public static async GerarHashSenha(valor: string): Promise<string> {
        return crypto.createHash('md5').update(valor).digest('hex');
    }

    static GerarHash() {
        return crypto.randomUUID().replaceAll('-', '');
    }

}