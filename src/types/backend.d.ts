export interface IBackendRes<T> {
    error?: string | string[];
    message: string;
    statusCode: number | string;
    data?: T;
}

export interface IModelPaginate<T> {
    meta: {
        page: number;
        pageSize: number;
        pages: number;
        total: number;
    },
    result: T[]
}

export interface IAccount {
    access_token: string;
    user: {
        id: string;
        email: string;
        name: string;
        role: {
            id: string;
            name: string;
            permissions: {
                id: string;
                name: string;
                apiPath: string;
                method: string;
                module: string;
            }[]
        }
    }
}

export interface IGetAccount extends Omit<IAccount, "access_token"> { }

export interface ICompany {
    id?: string;
    name?: string;
    address?: string;
    logo: string;
    description?: string;
    createdBy?: string;
    isDeleted?: boolean;
    deletedAt?: boolean | null;
    createdAt?: string;
    updatedAt?: string;
}

export interface ISkill {
    id?: string;
    name?: string;
    createdBy?: string;
    isDeleted?: boolean;
    deletedAt?: boolean | null;
    createdAt?: string;
    updatedAt?: string;
}

export interface IUser {
    id?: string;
    name: string;
    email: string;
    password?: string;
    age: number;
    gender: string;
    address: string;
    role?: {
        id: string;
        name: string;
    }
    company?: {
        id: string;
        name: string;
    }
    createdBy?: string;
    isDeleted?: boolean;
    deletedAt?: boolean | null;
    createdAt?: string;
    updatedAt?: string;
}

export interface IJob {
    id?: string;
    name: string;
    skills: ISkill[];
    company?: {
        id: string;
        name: string;
        logo?: string;
    }
    location: string;
    salary: number;
    quantity: number;
    level: string;
    description: string;
    startDate: Date;
    endDate: Date;
    active: boolean;

    createdBy?: string;
    isDeleted?: boolean;
    deletedAt?: boolean | null;
    createdAt?: string;
    updatedAt?: string;
}

export interface IResume {
    id?: string;
    email: string;
    url: string;
    status: string; // Enum: PENDING, APPROVED, REJECTED
    note?: string;  // Ghi chú (ví dụ: lý do từ chối hoặc hướng dẫn liên hệ)

    createdBy?: string;
    updatedBy?: string;
    createdAt?: string;
    updatedAt?: string;

    // 👤 Thông tin người nộp (user)
    user?: {
        id: string;
        name: string;
    };

    // 💼 Thông tin công việc
    job?: {
        id: string;
        name: string;
        location: string;
        salary: number;
        level: string;
        company: {
            id: string;
            name: string;
            address?: string;
            logo?: string;
            description?: string;
        };
    };

    // 🕒 Lịch sử cập nhật trạng thái (tuỳ chọn)
    history?: {
        status: string;
        updatedAt: Date;
        updatedBy: { id: string; email: string };
    }[];
}


export interface IPermission {
    id?: string;
    name?: string;
    apiPath?: string;
    method?: string;
    module?: string;

    createdBy?: string;
    isDeleted?: boolean;
    deletedAt?: boolean | null;
    createdAt?: string;
    updatedAt?: string;
}

export interface IRole {
    id?: string;
    name: string;
    description: string;
    active: boolean;
    permissions: IPermission[] | string[];

    createdBy?: string;
    isDeleted?: boolean;
    deletedAt?: boolean | null;
    createdAt?: string;
    updatedAt?: string;
}

export interface ISubscribers {
    id?: string;
    name?: string;
    email?: string;
    skills: string[];
    createdBy?: string;
    isDeleted?: boolean;
    deletedAt?: boolean | null;
    createdAt?: string;
    updatedAt?: string;
}

// 🏢 Interface mới cho CompanyRegistration
export interface ICompanyRegistration {
    id?: string;

    // 👤 Thông tin user tạo bản đăng ký
    user?: {
        id: string;
        email: string;
        name: string;
    };

    companyName: string;
    description?: string;
    address?: string;
    logo?: string;
    facebookLink?: string;
    githubLink?: string;
    verificationDocument?: string;  // link file pdf/doc/docx
    rejectionReason?: string;

    // Trạng thái: PENDING, APPROVED, REJECTED
    status?: "PENDING" | "APPROVED" | "REJECTED";

    createdAt?: string;
    updatedAt?: string;
    createdBy?: string;
    updatedBy?: string;
}
export interface INotification {
    id?: string;
    resourceName: string;
    createdBy?: string;
    updatedBy?: string;
    createdAt?: string;
    updatedAt?: string;
    message: string;
    isDeleted?: boolean;
    deletedAt?: string | null;
}
