import React from 'react';
import { Typography, Row, Col } from 'antd';
import styles from './PaginationInfo.module.scss';

const { Paragraph, Text } = Typography;

const PaginationInfo = ({ paginationData, loadedCount }) => {
    if (!paginationData) return null;

    const totalElements = paginationData.total;

    return (
        <div className={styles.paginationInfoCard}>
            <Row align="middle" gutter={[16, 16]} className={styles.paginationRow}>
                <Col xs={24} lg={8}>
                    <Paragraph>
                        <Text strong>Éléments affichés :</Text> {loadedCount} sur {totalElements}
                    </Paragraph>
                </Col>
            </Row>
        </div>
    );
};

export default PaginationInfo;
