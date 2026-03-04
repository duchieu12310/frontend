import { IPermission } from '@/types/backend';
import { grey, green, blue, red, orange } from '@ant-design/colors';
import { RocketOutlined, CodeOutlined, LineChartOutlined, TeamOutlined, BankOutlined, RobotOutlined } from '@ant-design/icons';
import groupBy from 'lodash/groupBy';
import map from 'lodash/map';
import React from 'react';

export const SKILLS_LIST =
    [
        { label: "React.JS", value: "REACT.JS" },
        { label: "React Native", value: "REACT NATIVE" },
        { label: "Vue.JS", value: "VUE.JS" },
        { label: "Angular", value: "ANGULAR" },
        { label: "Nest.JS", value: "NEST.JS" },
        { label: "TypeScript", value: "TYPESCRIPT" },
        { label: "Java", value: "JAVA" },
        { label: "Java Spring", value: "JAVA SPRING" },
        { label: "Frontend", value: "FRONTEND" },
        { label: "Backend", value: "BACKEND" },
        { label: "Fullstack", value: "FULLSTACK" }
    ];

export const LOCATION_LIST = [
    { label: "Hà Nội", value: "HA_NOI" },
    { label: "TP Hồ Chí Minh", value: "TP.HCM" },
    { label: "An Giang", value: "AN_GIANG" },
    { label: "Bà Rịa - Vũng Tàu", value: "BA_RIA_VUNG_TAU" },
    { label: "Bắc Giang", value: "BAC_GIANG" },
    { label: "Bắc Kạn", value: "BAC_KAN" },
    { label: "Bạc Liêu", value: "BAC_LIEU" },
    { label: "Bắc Ninh", value: "BAC_NINH" },
    { label: "Bến Tre", value: "BEN_TRE" },
    { label: "Bình Định", value: "BINH_DINH" },
    { label: "Bình Dương", value: "BINH_DUONG" },
    { label: "Bình Phước", value: "BINH_PHUOC" },
    { label: "Bình Thuận", value: "BINH_THUAN" },
    { label: "Cà Mau", value: "CA_MAU" },
    { label: "Cần Thơ", value: "CAN_THO" },
    { label: "Cao Bằng", value: "CAO_BANG" },
    { label: "Đà Nẵng", value: "DA_NANG" },
    { label: "Đắk Lắk", value: "DAK_LAK" },
    { label: "Đắk Nông", value: "DAK_NONG" },
    { label: "Điện Biên", value: "DIEN_BIEN" },
    { label: "Đồng Nai", value: "DONG_NAI" },
    { label: "Đồng Tháp", value: "DONG_THAP" },
    { label: "Gia Lai", value: "GIA_LAI" },
    { label: "Hà Giang", value: "HA_GIANG" },
    { label: "Hà Nam", value: "HA_NAM" },
    { label: "Hà Tĩnh", value: "HA_TINH" },
    { label: "Hải Dương", value: "HAI_DUONG" },
    { label: "Hải Phòng", value: "HAI_PHONG" },
    { label: "Hậu Giang", value: "HAU_GIANG" },
    { label: "Hòa Bình", value: "HOA_BINH" },
    { label: "Hưng Yên", value: "HUNG_YEN" },
    { label: "Khánh Hòa", value: "KHANH_HOA" },
    { label: "Kiên Giang", value: "KIEN_GIANG" },
    { label: "Kon Tum", value: "KON_TUM" },
    { label: "Lai Châu", value: "LAI_CHAU" },
    { label: "Lâm Đồng", value: "LAM_DONG" },
    { label: "Lạng Sơn", value: "LANG_SON" },
    { label: "Lào Cai", value: "LAO_CAI" },
    { label: "Long An", value: "LONG_AN" },
    { label: "Nam Định", value: "NAM_DINH" },
    { label: "Nghệ An", value: "NGHE_AN" },
    { label: "Ninh Bình", value: "NINH_BINH" },
    { label: "Ninh Thuận", value: "NINH_THUAN" },
    { label: "Phú Thọ", value: "PHU_THO" },
    { label: "Phú Yên", value: "PHU_YEN" },
    { label: "Quảng Bình", value: "QUANG_BINH" },
    { label: "Quảng Nam", value: "QUANG_NAM" },
    { label: "Quảng Ngãi", value: "QUANG_NGAI" },
    { label: "Quảng Ninh", value: "QUANG_NINH" },
    { label: "Quảng Trị", value: "QUANG_TRI" },
    { label: "Sóc Trăng", value: "SOC_TRANG" },
    { label: "Sơn La", value: "SON_LA" },
    { label: "Tây Ninh", value: "TAY_NINH" },
    { label: "Thái Bình", value: "THAI_BINH" },
    { label: "Thái Nguyên", value: "THAI_NGUYEN" },
    { label: "Thanh Hóa", value: "THANH_HOA" },
    { label: "Thừa Thiên Huế", value: "THUA_THIEN_HUE" },
    { label: "Tiền Giang", value: "TIEN_GIANG" },
    { label: "Trà Vinh", value: "TRA_VINH" },
    { label: "Tuyên Quang", value: "TUYEN_QUANG" },
    { label: "Vĩnh Long", value: "VINH_LONG" },
    { label: "Vĩnh Phúc", value: "VINH_PHUC" },
    { label: "Yên Bái", value: "YEN_BAI" },
];

export const SALARY_RANGES = [
    { label: "Tất cả", value: "ALL" },
    { label: "Dưới 10 triệu", value: "LT10", min: 0, max: 10000000 },
    { label: "10 - 15 triệu", value: "10-15", min: 10000000, max: 15000000 },
    { label: "15 - 20 triệu", value: "15-20", min: 15000000, max: 20000000 },
    { label: "20 - 25 triệu", value: "20-25", min: 20000000, max: 25000000 },
    { label: "25 - 30 triệu", value: "25-30", min: 25000000, max: 30000000 },
    { label: "30 - 50 triệu", value: "30-50", min: 30000000, max: 50000000 },
    { label: "Trên 50 triệu", value: "GT50", min: 50000000, max: 999999999 },
    { label: "Thỏa thuận", value: "AGREEMENT", min: 0, max: 0 } // Handle specially if needed, mostly for display
];

export const LEVEL_LIST = [
    { label: "Tất cả", value: "ALL" },
    { label: "Intern", value: "INTERN" },
    { label: "Fresher", value: "FRESHER" },
    { label: "Junior", value: "JUNIOR" },
    { label: "Middle", value: "MIDDLE" },
    { label: "Senior", value: "SENIOR" },
    { label: "Lead", value: "LEAD" },
    { label: "Manager", value: "MANAGER" }
];

export const JOB_CATEGORIES = [
    { name: 'Kinh doanh / Bán hàng', icon: React.createElement(RocketOutlined), count: 1205 },
    { name: 'IT / Phần mềm', icon: React.createElement(CodeOutlined), count: 850 },
    { name: 'Marketing / Truyền thông', icon: React.createElement(LineChartOutlined), count: 540 },
    { name: 'Hành chính / Nhân sự', icon: React.createElement(TeamOutlined), count: 420 },
    { name: 'Tài chính / Kế toán', icon: React.createElement(BankOutlined), count: 310 },
    { name: 'Cơ khí / Chế tạo', icon: React.createElement(RobotOutlined), count: 280 },
];

export const nonAccentVietnamese = (str: string) => {
    str = str.replace(/A|Á|À|Ã|Ạ|Â|Ấ|Ầ|Ẫ|Ậ|Ă|Ắ|Ằ|Ẵ|Ặ/g, "A");
    str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
    str = str.replace(/E|É|È|Ẽ|Ẹ|Ê|Ế|Ề|Ễ|Ệ/, "E");
    str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
    str = str.replace(/I|Í|Ì|Ĩ|Ị/g, "I");
    str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
    str = str.replace(/O|Ó|Ò|Õ|Ọ|Ô|Ố|Ồ|Ỗ|Ộ|Ơ|Ớ|Ờ|Ỡ|Ợ/g, "O");
    str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
    str = str.replace(/U|Ú|Ù|Ũ|Ụ|Ư|Ứ|Ừ|Ữ|Ự/g, "U");
    str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
    str = str.replace(/Y|Ý|Ỳ|Ỹ|Ỵ/g, "Y");
    str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
    str = str.replace(/Đ/g, "D");
    str = str.replace(/đ/g, "d");
    // Some system encode vietnamese combining accent as individual utf-8 characters
    str = str.replace(/\u0300|\u0301|\u0303|\u0309|\u0323/g, ""); // Huyền sắc hỏi ngã nặng
    str = str.replace(/\u02C6|\u0306|\u031B/g, ""); // Â, Ê, Ă, Ơ, Ư
    return str;
}


export const convertSlug = (str: string) => {
    str = nonAccentVietnamese(str);
    str = str.replace(/^\s+|\s+$/g, ''); // trim
    str = str.toLowerCase();

    // remove accents, swap ñ for n, etc
    const from = "ÁÄÂÀÃÅČÇĆĎÉĚËÈÊẼĔȆĞÍÌÎÏİŇÑÓÖÒÔÕØŘŔŠŞŤÚŮÜÙÛÝŸŽáäâàãåčçćďéěëèêẽĕȇğíìîïıňñóöòôõøðřŕšşťúůüùûýÿžþÞĐđßÆa·/_,:;";
    const to = "AAAAAACCCDEEEEEEEEGIIIIINNOOOOOORRSSTUUUUUYYZaaaaaacccdeeeeeeeegiiiiinnooooooorrsstuuuuuyyzbBDdBAa------";
    for (let i = 0, l = from.length; i < l; i++) {
        str = str.replace(new RegExp(from.charAt(i), 'g'), to.charAt(i));
    }

    str = str.replace(/[^a-z0-9 -]/g, '') // remove invalid chars
        .replace(/\s+/g, '-') // collapse whitespace and replace by -
        .replace(/-+/g, '-'); // collapse dashes

    return str;
}

export const getLocationName = (value: string) => {
    const locationFilter = LOCATION_LIST.filter(item => item.value === value);
    if (locationFilter.length) return locationFilter[0].label;
    return value
}

export function colorMethod(method: "POST" | "PUT" | "GET" | "DELETE" | string) {
    switch (method) {
        case "POST":
            return green[6]
        case "PUT":
            return orange[6]
        case "GET":
            return blue[6]
        case "DELETE":
            return red[6]
        default:
            return grey[10];
    }
}

export const groupByPermission = (data: any[]): { module: string; permissions: IPermission[] }[] => {
    const groupedData = groupBy(data, x => x.module);
    return map(groupedData, (value, key) => {
        return { module: key, permissions: value as IPermission[] };
    });
};
