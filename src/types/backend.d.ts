export interface IBackendRes<T> {
    error?: string | string[];
    message: string;
    statusCode: number | string;
    data?: T;
}

export interface IProvince {
    id: number;
    name: string;
    code: string;
}

export interface IDistrict {
    id: number;
    name: string;
    code: string;
    province?: IProvince;
}

export interface IWard {
    id: number;
    name: string;
    code: string;
    district?: IDistrict;
}

export interface IAddress {
    id?: number;
    line?: string;
    province?: IProvince;
    district?: IDistrict;
    ward?: IWard;
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
    address?: IAddress;
    logo: string;
    description?: string;
    images?: { id?: number; url: string; type: string; displayOrder: number }[];
    descriptions?: { id?: number; content: string; type: string }[];
    taxCode?: string;
    status?: "PENDING" | "APPROVED" | "REJECTED" | "SUSPENDED";
    businessLicense?: string;
    owner?: IUser;
    approvedAt?: string;
    approvedBy?: string;
    rejectReason?: string;
    createdBy?: string;
    isDeleted?: boolean;
    deletedAt?: boolean | null;
    createdAt?: string;
    updatedAt?: string;
    packageExpireDate?: string;
    jobLimit?: number;
    jobDurationLimit?: number;
    hasAiSuggestCandidates?: boolean;
    hasAiEvaluateResume?: boolean;
    hasAiEvaluateCv?: boolean;
    hasAiFeatures?: boolean;
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
    address?: IAddress;
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
    level?: string;
    levels?: string[];
    description: string;
    startDate: Date;
    endDate: Date;
    active: boolean;
    status?: "PENDING" | "REVIEWING" | "APPROVED" | "REJECTED" | "REVISION_REQUIRED";
    requirements?: { id?: number; content: string }[];
    benefits?: { id?: number; content: string }[];

    createdBy?: string;
    isDeleted?: boolean;
    deletedAt?: boolean | null;
    createdAt?: string;
    updatedAt?: string;
}

export interface IResume {
    id?: string;
    email: string;
    url?: string;
    status: "PENDING" | "REVIEWING" | "APPROVED" | "REJECTED" | "REVISION_REQUIRED";
    note?: string;  // Ghi chú (ví dụ: lý do từ chối hoặc hướng dẫn liên hệ)
    formatCv?: {
        id: number;
        title: string;
    };
    matchScore?: number;
    aiReport?: string;

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
        level?: string;
        levels?: string[];
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

export interface ICVSectionLayout {
    id?: number;
    sectionKey: string;
    sectionName: string;
    columnPlacement: string;
    orderIndex: number;
    visible: boolean;
}

export interface ICVTemplate {
    id?: number;
    title: string;
    layout?: string;
    theme?: string;
    createdAt?: string;
    updatedAt?: string;
    sectionLayouts?: ICVSectionLayout[];
    personalInformations?: IPersonalInformation[];
    careerObjectives?: ICareerObjective[];
    educations?: IEducation[];
    technicalSkills?: ITechnicalSkill[];
    softSkills?: ISoftSkill[];
    projects?: IProject[];
    workExperiences?: IWorkExperience[];
    achievements?: IAchievement[];
    certifications?: ICertification[];
    activities?: IActivity[];
    languages?: ILanguage[];
    hobbies?: IHobby[];
}

export interface IPersonalInformation {
    id?: number;
    fullName: string;
    dateOfBirth?: string;
    phone: string;
    email: string;
    address?: string;
    github?: string;
    linkedin?: string;
    image?: string;
}

export interface ICareerObjective {
    id?: number;
    content: string;
}

export interface IEducation {
    id?: number;
    schoolName: string;
    major: string;
    startDate?: string;
    endDate?: string;
    gpa?: number;
}

export interface ITechnicalSkill {
    id?: number;
    skillName: string;
    level?: string;
}

export interface ISoftSkill {
    id?: number;
    skillName: string;
}

export interface IProject {
    id?: number;
    projectName: string;
    technologies?: string;
    description?: string;
    githubLink?: string;
}

export interface IWorkExperience {
    id?: number;
    company: string;
    position: string;
    startDate?: string;
    endDate?: string;
    description?: string;
}

export interface IAchievement {
    id?: number;
    title: string;
    description?: string;
}

export interface ICertification {
    id?: number;
    name: string;
    organization?: string;
    issueDate?: string;
}

export interface IActivity {
    id?: number;
    activityName: string;
    role?: string;
}

export interface ILanguage {
    id?: number;
    language: string;
    level?: string;
}

export interface IHobby {
    id?: number;
    hobby: string;
}

export interface IFormatCV {
    id?: number;
    title: string;
    theme?: string;
    status?: "PENDING" | "REVIEWING" | "APPROVED" | "REJECTED" | "REVISION_REQUIRED";
    layoutKey?: string;
    selectedTemplateIds?: number[];
    sectionLayouts?: ICVSectionLayout[];
    createdAt?: string;
    updatedAt?: string;
    createdBy?: string;
    updatedBy?: string;
    user?: {
        id: string;
        name: string;
        email: string;
    };
    cvTemplate?: {
        id: number;
        title: string;
    };
    personalInformations?: IPersonalInformation[];
    careerObjectives?: ICareerObjective[];
    educations?: IEducation[];
    technicalSkills?: ITechnicalSkill[];
    softSkills?: ISoftSkill[];
    projects?: IProject[];
    workExperiences?: IWorkExperience[];
    achievements?: IAchievement[];
    certifications?: ICertification[];
    activities?: IActivity[];
    languages?: ILanguage[];
    hobbies?: IHobby[];
}

export interface IEditRequest {
    id?: number;
    user?: IUser;
    targetType: "COMPANY" | "CV" | "JOB" | "USER";
    targetId: number;
    data: string; // JSON string
    status?: "PENDING" | "REVIEWING" | "APPROVED" | "REJECTED" | "REVISION_REQUIRED";
    notes?: string;
    createdAt?: string;
    updatedAt?: string;
    createdBy?: string;
    updatedBy?: string;
}

export interface ISubscriptionPackage {
    id: number;
    name: string;
    description: string;
    price: number;
    durationDays: number;
    jobLimit: number;
    jobDurationLimit: number;
    hasAiSuggestCandidates: boolean;
    hasAiEvaluateResume: boolean;
    hasAiEvaluateCv: boolean;
}

export interface ICvJobMatch {
    id?: number;
    matchScore?: number;
    matchReason?: string;
    missingSkills?: string;
    createdAt?: string;
    updatedAt?: string;

    // Cv Info
    cvId?: number;
    cvTitle?: string;
    candidateName?: string;

    // Job Info
    jobId?: number;
    jobTitle?: string;
    companyName?: string;
}

export interface IAiCheckLog {
    id?: number;
    cvId?: number;
    cvTitle?: string;
    candidateName?: string;
    evaluationReport?: string;
    isInvalid?: boolean;
    createdBy?: string;
    createdAt?: string;
    updatedAt?: string;
}
