import React from 'react';
import { Card, Avatar, Button, Col, Row } from 'antd';
import { MailOutlined, EditOutlined } from '@ant-design/icons';
import styles from './UserProfilePage.module.scss';
import { useUserContext } from '../../providers/UserProvider';
import Main from '../../components/layout/Main';
import ChangePassword from '../../components/user/ChangePassword';

const UserProfilePage = () => {
    const { currentUser: user } = useUserContext();
    if(!user) return null;
    return (
        <Main>
            <div className={styles.container}>
                <Card className={styles.card}>
                    <div className={styles.header}>
                        <Avatar size={100} src={user.avatar} className={styles.avatar} />
                        <div className={styles.info}>
                            <h1 className={styles.name}>{user.name}</h1>
                            <p className={styles.email}><MailOutlined /> {user.email}</p>
                            <Button type="primary" danger icon={<EditOutlined />}>Modifier mon profil</Button>
                        </div>
                    </div>
                    <Row gutter={[24, 0]} justify="start">
                      <Col
                          xs={{ span: 24 }}
                          md={{ span: 12 }}
                      >
                        <ChangePassword></ChangePassword>
                      </Col>
                  </Row>
                </Card>
            </div>
        </Main>
    );
};

export default UserProfilePage;