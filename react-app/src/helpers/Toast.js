import { message } from 'antd';


 const Toast = {
    success: (text) => {
        message.success(text);
    },
    error: (text) => {
        message.error(text);
    },
    warning: (text) => {
        message.warning(text);
    },
    info: (text) => {
        message.info(text);
    }
};

export default Toast;