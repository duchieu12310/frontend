import React from "react";
import '@/config/i18n';
import ReactDOM from "react-dom/client";
import App from "./App";
import { Provider } from "react-redux";
import { store } from "@/redux/store";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { ConfigProvider } from 'antd';
import viVN from 'antd/locale/vi_VN';
import { ProConfigProvider, viVNIntl } from '@ant-design/pro-components';

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId="296915052940-6elee6034cqlnvcr5eo1s3n5lo9v2jmu.apps.googleusercontent.com">
      <Provider store={store}>
        <ConfigProvider
          locale={viVN}
          theme={{
            token: {
              colorPrimary: '#14372f',
              borderRadius: 8,
            }
          }}
        >
          {/* @ts-ignore */}
          <ProConfigProvider intl={viVNIntl}>
            <App />
          </ProConfigProvider>
        </ConfigProvider>
      </Provider>
    </GoogleOAuthProvider>
  </React.StrictMode>
);
