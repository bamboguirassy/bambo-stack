// LoadingPlaceholder.jsx
import React from 'react';
import { Skeleton, Card } from 'antd';
import styles from './LoadingPlaceholder.module.scss';

const LoadingPlaceholder = ({rows = 4}) => (
  <Card className={styles['placeholder-container']}>
    <Skeleton.Avatar active size={64} className={styles['skeleton-avatar']} />
    <Skeleton active paragraph={{ rows: rows }} className={styles['skeleton-paragraph']} />
    <Skeleton.Avatar active size={64} className={styles['skeleton-avatar']} />
    <Skeleton active paragraph={{ rows: rows }} className={styles['skeleton-paragraph']} />
    <Skeleton.Avatar active size={64} className={styles['skeleton-avatar']} />
    <Skeleton active paragraph={{ rows: rows }} className={styles['skeleton-paragraph']} />
  </Card>
);

export default LoadingPlaceholder;