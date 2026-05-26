import {
    IBackendRes,
    ICompany,
    IAccount,
    IUser,
    IModelPaginate,
    IGetAccount,
    IJob,
    IResume,
    IPermission,
    IRole,
    ISkill,
    ISubscribers,
    INotification,
    ICVTemplate,
    IFormatCV,
    IProvince,
    IDistrict,
    IWard,
    IAddress
} from '@/types/backend';

import axios from 'config/axios-customize';

/**
 * Module Auth
 */
export const callRegister = (name: string, email: string, password: string, age: number, gender: string, address: IAddress, roleName?: string) => {
    const role = roleName ? { name: roleName } : undefined;
    return axios.post<IBackendRes<IUser>>('/api/v1/auth/register', { name, email, password, age, gender, address, role })
}
export const callRegisterConfirm = (userId: number, token: string) => {
    return axios.post<IBackendRes<any>>('/api/v1/auth/register/confirm', { userId, token });
}
export const callRegisterResend = (userId: number) => {
    return axios.post<IBackendRes<any>>(`/api/v1/auth/register/resend?userId=${userId}`);
}
export const callRegisterChangeEmail = (userId: number, email: string) => {
    return axios.post<IBackendRes<any>>(`/api/v1/auth/register/change-email?userId=${userId}&email=${email}`);
}
export const callRegisterCancel = (userId: number) => {
    return axios.post<IBackendRes<any>>(`/api/v1/auth/register/cancel?userId=${userId}`);
}
export const callChangePassword = (data: { oldPassword: string; newPassword: string }) => {
    return axios.put("/api/v1/auth/change-password", data);
};
export const callUpdateUserInfo = (data: { name?: string; age?: number; gender?: string; address?: IAddress }) => {
    return axios.put("/api/v1/users", data);
};
export const callLogin = (username: string, password: string) => {
    return axios.post<IBackendRes<IAccount>>('/api/v1/auth/login', { username, password })
}
export const callLoginGoogle = (idToken: string) => {
    return axios.post("/api/v1/auth/login-google", {
        idToken
    });
};
export const callFetchAccount = () => {
    return axios.get<IBackendRes<IGetAccount>>('/api/v1/auth/account')
}
export const callRefreshToken = () => {
    return axios.get<IBackendRes<IAccount>>('/api/v1/auth/refresh')
}
export const callLogout = () => {
    return axios.post<IBackendRes<string>>('/api/v1/auth/logout')
}

/**
 * Upload single file
 */
export const callUploadSingleFile = (file: any, folderType: string) => {
    const bodyFormData = new FormData();
    bodyFormData.append('file', file);
    bodyFormData.append('folder', folderType);

    return axios<IBackendRes<{ fileName: string }>>({
        method: 'post',
        url: '/api/v1/files',
        data: bodyFormData,
        headers: { "Content-Type": "multipart/form-data" },
    });
}

/**
 * Module Company
 */
export const callCreateCompany = (company: ICompany) => {
    return axios.post<IBackendRes<ICompany>>('/api/v1/companies', company)
}
export const callUpdateCompany = (company: ICompany) => {
    return axios.put<IBackendRes<ICompany>>(`/api/v1/companies`, company)
}
export const callDeleteCompany = (id: string) => {
    return axios.delete<IBackendRes<ICompany>>(`/api/v1/companies/${id}`);
}
export const callFetchCompany = (query: string) => {
    return axios.get<IBackendRes<IModelPaginate<ICompany>>>(`/api/v1/companies?${query}`);
}
export const callAllCompany = (query: string) => {
    return axios.get<IBackendRes<IModelPaginate<ICompany>>>(`/api/v1/companies/all?${query}`);
}
export const callFetchCompanyPublic = (query: string) => {
    return axios.get<IBackendRes<IModelPaginate<ICompany>>>(`/api/v1/companies/public?${query}`);
}
export const callFetchCompanyById = (id: string) => {
    return axios.get<IBackendRes<ICompany>>(`/api/v1/companies/${id}`);
}

/**
 * Module Skill
 */
export const callCreateSkill = (name: string) => {
    return axios.post<IBackendRes<ISkill>>('/api/v1/skills', { name })
}
export const callUpdateSkill = (id: string, name: string) => {
    return axios.put<IBackendRes<ISkill>>(`/api/v1/skills`, { id, name })
}
export const callDeleteSkill = (id: string) => {
    return axios.delete<IBackendRes<ISkill>>(`/api/v1/skills/${id}`);
}
export const callFetchAllSkill = (query: string) => {
    return axios.get<IBackendRes<IModelPaginate<ISkill>>>(`/api/v1/skills?${query}`);
}

/**
 * Module User
 */
export const callCreateUser = (user: IUser) => {
    return axios.post<IBackendRes<IUser>>('/api/v1/users', { ...user })
}
export const callUpdateUser = (user: IUser) => {
    return axios.put<IBackendRes<IUser>>(`/api/v1/users`, { ...user })
}
export const callDeleteUser = (id: string) => {
    return axios.delete<IBackendRes<IUser>>(`/api/v1/users/${id}`);
}
export const callFetchUser = (query: string) => {
    return axios.get<IBackendRes<IModelPaginate<IUser>>>(`/api/v1/users?${query}`);
}

/**
 * Module Job
 */
export const callCreateJob = (job: IJob) => {
    return axios.post<IBackendRes<IJob>>('/api/v1/jobs', { ...job })
}
export const callUpdateJob = (job: IJob, id: string) => {
    return axios.put<IBackendRes<IJob>>(`/api/v1/jobs`, { id, ...job })
}
export const callDeleteJob = (id: string) => {
    return axios.delete<IBackendRes<IJob>>(`/api/v1/jobs/${id}`);
}
export const callFetchJob = (query: string) => {
    return axios.get<IBackendRes<IModelPaginate<IJob>>>(`/api/v1/jobs?${query}`);
}
export const callFetchJobById = (id: string) => {
    return axios.get<IBackendRes<IJob>>(`/api/v1/jobs/${id}`);
}
export const callFetchAllJob = (query: string) => {
    return axios.get<IBackendRes<IModelPaginate<IJob>>>(`/api/v1/jobs/all?${query}`);
}
export const callSearchJob = (query: string) => {
    return axios.get<IBackendRes<IModelPaginate<IJob>>>(`/api/v1/jobs/search?${query}`);
}

/**
 * Module Resume
 */
export const callCreateResume = (url: string, jobId: any, email: string, userId: string | number, formatCvId?: number) => {
    return axios.post<IBackendRes<IResume>>('/api/v1/resumes', {
        email,
        url: url || null,
        status: "PENDING",
        user: { id: userId },
        job: { id: jobId },
        formatCv: formatCvId ? { id: formatCvId } : null
    })
}
export const callUpdateResumeStatus = (id: any, status: string) => {
    return axios.put<IBackendRes<IResume>>(`/api/v1/resumes`, { id, status })
}
export const callDeleteResume = (id: string) => {
    return axios.delete<IBackendRes<IResume>>(`/api/v1/resumes/${id}`);
}
export const callFetchResume = (query: string) => {
    return axios.get<IBackendRes<IModelPaginate<IResume>>>(`/api/v1/resumes?${query}`);
}
export const callFetchResumeById = (id: string) => {
    return axios.get<IBackendRes<IResume>>(`/api/v1/resumes/${id}`);
}
export const callFetchResumeByUser = () => {
    return axios.post<IBackendRes<IModelPaginate<IResume>>>(`/api/v1/resumes/by-user`);
}
export const callUpdateResumeById = (id: number | string, data: { status?: string; note?: string }) => {
    return axios.put<IBackendRes<IResume>>(`/api/v1/resumes`, { id, ...data });
}

/**
 * Module Permission
 */
export const callCreatePermission = (permission: IPermission) => {
    return axios.post<IBackendRes<IPermission>>('/api/v1/permissions', { ...permission })
}
export const callUpdatePermission = (permission: IPermission, id: string) => {
    return axios.put<IBackendRes<IPermission>>(`/api/v1/permissions`, { id, ...permission })
}
export const callDeletePermission = (id: string) => {
    return axios.delete<IBackendRes<IPermission>>(`/api/v1/permissions/${id}`);
}
export const callFetchPermission = (query: string) => {
    return axios.get<IBackendRes<IModelPaginate<IPermission>>>(`/api/v1/permissions?${query}`);
}
export const callFetchPermissionById = (id: string) => {
    return axios.get<IBackendRes<IPermission>>(`/api/v1/permissions/${id}`);
}

/**
 * Module Role
 */
export const callCreateRole = (role: IRole) => {
    return axios.post<IBackendRes<IRole>>('/api/v1/roles', { ...role })
}
export const callUpdateRole = (role: IRole, id: string) => {
    return axios.put<IBackendRes<IRole>>(`/api/v1/roles`, { id, ...role })
}
export const callDeleteRole = (id: string) => {
    return axios.delete<IBackendRes<IRole>>(`/api/v1/roles/${id}`);
}
export const callFetchRole = (query: string) => {
    return axios.get<IBackendRes<IModelPaginate<IRole>>>(`/api/v1/roles?${query}`);
}
export const callFetchRoleById = (id: string) => {
    return axios.get<IBackendRes<IRole>>(`/api/v1/roles/${id}`);
}

/**
 * Module Subscribers
 */
export const callCreateSubscriber = (subs: ISubscribers) => {
    return axios.post<IBackendRes<ISubscribers>>('/api/v1/subscribers', { ...subs })
}
export const callGetSubscriberSkills = () => {
    return axios.post<IBackendRes<ISubscribers>>('/api/v1/subscribers/skills')
}
export const callUpdateSubscriber = (subs: ISubscribers) => {
    return axios.put<IBackendRes<ISubscribers>>(`/api/v1/subscribers`, { ...subs })
}
export const callDeleteSubscriber = (id: string) => {
    return axios.delete<IBackendRes<ISubscribers>>(`/api/v1/subscribers/${id}`);
}
export const callFetchSubscriber = (query: string) => {
    return axios.get<IBackendRes<IModelPaginate<ISubscribers>>>(`/api/v1/subscribers?${query}`);
}
export const callFetchSubscriberById = (id: string) => {
    return axios.get<IBackendRes<ISubscribers>>(`/api/v1/subscribers/${id}`);
}



/**
 * Module Notification (Mới thêm)
 */
export const callFetchNotificationsLast24h = () => {
    return axios.get<IBackendRes<INotification[]>>('/api/notifications/last24h');
}

/**
 * Module ChatBot
 */
export const callChatBotSearch = (query: string) => {
    return axios.post<IBackendRes<any[]>>('/api/v1/chatbot/search', { query });
}

export const callChatBotSync = () => {
    return axios.post<IBackendRes<string>>('/api/v1/chatbot/sync');
}

/**
 * Module CV Template
 */
export const callFetchCVTemplates = (query: string) => {
    return axios.get<IBackendRes<IModelPaginate<ICVTemplate>>>(`/api/v1/cv-templates?${query}`);
}

export const callFetchCVTemplateById = (id: number) => {
    return axios.get<IBackendRes<ICVTemplate>>(`/api/v1/cv-templates/${id}`);
}

export const callCreateCVTemplate = (cvTemplate: ICVTemplate) => {
    return axios.post<IBackendRes<ICVTemplate>>('/api/v1/cv-templates', cvTemplate);
}

export const callUpdateCVTemplate = (cvTemplate: ICVTemplate) => {
    return axios.put<IBackendRes<ICVTemplate>>('/api/v1/cv-templates', cvTemplate);
}

export const callDeleteCVTemplate = (id: number) => {
    return axios.delete<IBackendRes<any>>(`/api/v1/cv-templates/${id}`);
}

/**
 * Module Format CV
 */
export const callFetchFormatCVs = (query: string) => {
    return axios.get<IBackendRes<IModelPaginate<IFormatCV>>>(`/api/v1/format-cvs?${query}`);
}

export const callFetchFormatCVById = (id: number) => {
    return axios.get<IBackendRes<IFormatCV>>(`/api/v1/format-cvs/${id}`);
}

export const callCreateFormatCV = (formatCV: IFormatCV) => {
    return axios.post<IBackendRes<IFormatCV>>('/api/v1/format-cvs', formatCV);
}

export const callUpdateFormatCV = (formatCV: IFormatCV) => {
    return axios.put<IBackendRes<IFormatCV>>('/api/v1/format-cvs', formatCV);
}

export const callDeleteFormatCV = (id: number) => {
    return axios.delete<IBackendRes<any>>(`/api/v1/format-cvs/${id}`);
}

/**
 * Module Address / Divisions
 */
export const callFetchProvinces = () => {
    return axios.get<IBackendRes<IProvince[]>>('/api/v1/provinces');
}
export const callFetchDistricts = (provinceId: number) => {
    return axios.get<IBackendRes<IDistrict[]>>(`/api/v1/districts?provinceId=${provinceId}`);
}
export const callFetchWards = (districtId: number) => {
    return axios.get<IBackendRes<IWard[]>>(`/api/v1/wards?districtId=${districtId}`);
}

