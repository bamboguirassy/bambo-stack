// UserGroupesForm.js
import React, { useState, useEffect } from 'react';
import { Modal, Form, Checkbox, Button, Spin, Input } from 'antd';
import { catchError } from '../../services/DaoService';
import Toast from '../../helpers/Toast';
import { GroupeService } from '../../services/GroupeService';
import UserService from '../../services/UserService';

const { Search } = Input;

const UserGroupesForm = ({ userId, visible, onCancel, onUpdate }) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [groupes, setGroupes] = useState([]);
    const [filteredGroupes, setFilteredGroupes] = useState([]);
    const [selectedGroupes, setSelectedGroupes] = useState([]);

    useEffect(() => {
        setLoading(true);
        Promise.all([
            GroupeService.getInstance().all(),
            UserService.getInstance().findLinkedGroupes(userId)
        ]).then(([groupesResponse, linkedGroupesResponse]) => {
            setGroupes(groupesResponse.data);
            setSelectedGroupes(linkedGroupesResponse.data.map(groupe => groupe.id));
            setFilteredGroupes(groupesResponse.data);
        }).catch((error) => {
            catchError(error);
        }).finally(() => {
            setLoading(false);
        });
    }, [userId]);

    const onFinish = () => {
        setSubmitting(true);
        UserService.getInstance()
            .linkGroupes(userId, { groupeIds: selectedGroupes })
            .then((response) => {
                Toast.success(response.message);
                onUpdate();
            })
            .catch((error) => {
                catchError(error);
            })
            .finally(() => {
                setSubmitting(false);
            });
    };

    const onChange = (checkedValues) => {
        setSelectedGroupes(checkedValues);
    };

    const onSearch = (value) => {
        const filtered = groupes.filter(groupe => groupe.nom.toLowerCase().includes(value.toLowerCase()));
        setFilteredGroupes(filtered);
    };

    return (
        <Modal
            open={visible}
            title="Associer des groupes"
            onCancel={onCancel}
            footer={[
                <Button key="cancel" onClick={onCancel}>
                    Annuler
                </Button>,
                <Button key="submit" type="primary" onClick={onFinish} loading={submitting}>
                    Enregistrer
                </Button>
            ]}
        >
            <Spin spinning={loading}>
                <Search placeholder="Rechercher un groupe" onSearch={onSearch} style={{ marginBottom: '1rem' }} />
                <Form form={form} layout="vertical">
                    <Form.Item>
                        <Checkbox.Group style={{ width: '100%' }} onChange={onChange} value={selectedGroupes} defaultValue={selectedGroupes}>
                            {filteredGroupes.map((groupe) => (
                                <Checkbox key={groupe.id} value={groupe.id} style={{ width: '100%' }}>
                                    {groupe.nom}
                                </Checkbox>
                            ))}
                        </Checkbox.Group>
                    </Form.Item>
                </Form>
            </Spin>
        </Modal>
    );
};

export default UserGroupesForm;
