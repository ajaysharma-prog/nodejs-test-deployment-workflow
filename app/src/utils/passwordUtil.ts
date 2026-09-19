import { hash, compare} from "bcryptjs";

export const hashPassword = async (password: string): Promise<string> => {
    return hash(password,10);
}

export const comparePassword = async (password: string, hashPassword: string): Promise<boolean> => {
    return compare(password, hashPassword);
}
