// UnauthorizedMessage.jsx
import React from 'react';
import { Button } from 'antd';
import { FrownOutlined } from '@ant-design/icons';
import styles from './UnauthorizedMessage.module.scss';

const UnauthorizedMessage = () => {
    const onRetry = () => {
        window.location.reload();
    };
    
    return (
        <div className={`${styles['unauthorized-container']} full-height`}>
            <FrownOutlined className={styles.icon} />
            <div className={styles.message}>Accès Refusé</div>
            <div className={styles.description}>
                Vous n'avez pas les autorisations nécessaires pour accéder à cette page.
            </div>
            <Button type="primary" className={styles.button} onClick={onRetry}>
                Réessayer
            </Button>
        </div>
    );
}

export default UnauthorizedMessage;
