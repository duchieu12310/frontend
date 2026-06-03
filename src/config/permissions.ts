export const ALL_PERMISSIONS = {
    COMPANIES: {
        GET_PAGINATE: { method: "GET", apiPath: '/api/v1/companies', module: "COMPANIES" },
        CREATE: { method: "POST", apiPath: '/api/v1/companies', module: "COMPANIES" },
        UPDATE: { method: "PUT", apiPath: '/api/v1/companies', module: "COMPANIES" },
        DELETE: { method: "DELETE", apiPath: '/api/v1/companies/{id}', module: "COMPANIES" },
    },
    JOBS: {
        GET_PAGINATE: { method: "GET", apiPath: '/api/v1/jobs', module: "JOBS" },
        CREATE: { method: "POST", apiPath: '/api/v1/jobs', module: "JOBS" },
        UPDATE: { method: "PUT", apiPath: '/api/v1/jobs', module: "JOBS" },
        DELETE: { method: "DELETE", apiPath: '/api/v1/jobs/{id}', module: "JOBS" },
    },
    PERMISSIONS: {
        GET_PAGINATE: { method: "GET", apiPath: '/api/v1/permissions', module: "PERMISSIONS" },
        CREATE: { method: "POST", apiPath: '/api/v1/permissions', module: "PERMISSIONS" },
        UPDATE: { method: "PUT", apiPath: '/api/v1/permissions', module: "PERMISSIONS" },
        DELETE: { method: "DELETE", apiPath: '/api/v1/permissions/{id}', module: "PERMISSIONS" },
    },
    RESUMES: {
        GET_PAGINATE: { method: "GET", apiPath: '/api/v1/resumes', module: "RESUMES" },
        CREATE: { method: "POST", apiPath: '/api/v1/resumes', module: "RESUMES" },
        UPDATE: { method: "PUT", apiPath: '/api/v1/resumes', module: "RESUMES" },
        DELETE: { method: "DELETE", apiPath: '/api/v1/resumes/{id}', module: "RESUMES" },
    },
    ROLES: {
        GET_PAGINATE: { method: "GET", apiPath: '/api/v1/roles', module: "ROLES" },
        CREATE: { method: "POST", apiPath: '/api/v1/roles', module: "ROLES" },
        UPDATE: { method: "PUT", apiPath: '/api/v1/roles', module: "ROLES" },
        DELETE: { method: "DELETE", apiPath: '/api/v1/roles/{id}', module: "ROLES" },
    },
    USERS: {
        GET_PAGINATE: { method: "GET", apiPath: '/api/v1/users', module: "USERS" },
        CREATE: { method: "POST", apiPath: '/api/v1/users', module: "USERS" },
        UPDATE: { method: "PUT", apiPath: '/api/v1/users', module: "USERS" },
        DELETE: { method: "DELETE", apiPath: '/api/v1/users/{id}', module: "USERS" },
    },
    FORMAT_CVS: {
        GET_PAGINATE: { method: "GET", apiPath: '/api/v1/format-cvs', module: "FORMAT_CVS" },
        CREATE: { method: "POST", apiPath: '/api/v1/format-cvs', module: "FORMAT_CVS" },
        UPDATE: { method: "PUT", apiPath: '/api/v1/format-cvs', module: "FORMAT_CVS" },
        DELETE: { method: "DELETE", apiPath: '/api/v1/format-cvs/{id}', module: "FORMAT_CVS" },
    },
    CV_TEMPLATES: {
        GET_PAGINATE: { method: "GET", apiPath: '/api/v1/cv-templates', module: "CV_TEMPLATES" },
        CREATE: { method: "POST", apiPath: '/api/v1/cv-templates', module: "CV_TEMPLATES" },
        UPDATE: { method: "PUT", apiPath: '/api/v1/cv-templates', module: "CV_TEMPLATES" },
        DELETE: { method: "DELETE", apiPath: '/api/v1/cv-templates/{id}', module: "CV_TEMPLATES" },
    },
    EDIT_REQUESTS: {
        GET_PAGINATE: { method: "GET", apiPath: '/api/v1/edit-requests', module: "EDIT_REQUESTS" },
        CREATE: { method: "POST", apiPath: '/api/v1/edit-requests', module: "EDIT_REQUESTS" },
        APPROVE: { method: "POST", apiPath: '/api/v1/edit-requests/{id}/approve', module: "EDIT_REQUESTS" },
        REJECT: { method: "POST", apiPath: '/api/v1/edit-requests/{id}/reject', module: "EDIT_REQUESTS" },
        REVISION: { method: "POST", apiPath: '/api/v1/edit-requests/{id}/revision', module: "EDIT_REQUESTS" },
    },
}

export const ALL_MODULES = {
    COMPANIES: 'COMPANIES',
    FILES: 'FILES',
    JOBS: 'JOBS',
    PERMISSIONS: 'PERMISSIONS',
    RESUMES: 'RESUMES',
    ROLES: 'ROLES',
    USERS: 'USERS',
    SUBSCRIBERS: 'SUBSCRIBERS',
    FORMAT_CVS: 'FORMAT_CVS',
    CV_TEMPLATES: 'CV_TEMPLATES',
    EDIT_REQUESTS: 'EDIT_REQUESTS'
}