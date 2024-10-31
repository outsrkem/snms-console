export function toLoginPage() {
    let url = `/authui/login.html?returnto=${encodeURIComponent(window.location.href)}`;
    return window.location.href = url;
}

export function toUserCenter() {
    let url = `/console/#/accountInfo`;
    return window.location.href = url;
}

export function toConsole() {
    let url = `/console`;
    return window.location.href = url;
}

export function saveNavPath(activePath) {
    window.sessionStorage.setItem('active-path', activePath)
}

// 加载保存配置信息
import { Options } from "@/api/index.js";
export function loadOptions() {
    Options().then((res) => {
        let options = res.payload.options;
        window.localStorage.setItem("SCHOOL_NAME", options.SCHOOL_NAME);
        window.localStorage.setItem("COLUMN_OF_REPORT", JSON.stringify(options.COLUMN_OF_REPORT));
    });
}