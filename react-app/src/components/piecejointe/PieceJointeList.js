import React, { useState, useEffect, useRef } from 'react';
import { Button, List, Input, Modal, Form, message, Spin, Popconfirm, Space, Divider } from 'antd';
import { UploadOutlined, DeleteOutlined, FileOutlined } from '@ant-design/icons';
import styles from './PieceJointeList.module.scss';
import Toast from '../../helpers/Toast';
import PieceJointeService from '../../services/PieceJointeService';
import { catchError } from '../../services/DaoService';
import Moment from 'react-moment';

const PieceJointeList = ({ parentType, parentId }) => {
  const [attachments, setAttachments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchAttachments = async () => {
      setLoading(true);
      try {
        const data = await PieceJointeService.getInstance().findByParent(parentType, parentId);
        setAttachments(data.data);
      } catch (error) {
        message.error('Erreur lors de la récupération des pièces jointes.');
      } finally {
        setLoading(false);
      }
    };

    fetchAttachments();
  }, [parentType, parentId]);

  const handleUpload = () => {
    if (!file || !fileName) {
      message.error('Veuillez sélectionner un fichier et entrer un nom.');
      return;
    }
    const formData = new FormData();
    formData.append('piece', file);
    formData.append('nom', fileName);
    formData.append('type', parentType);
    formData.append('parent_id', parentId);
    PieceJointeService.getInstance().create(formData)
      .then(response => {
        setAttachments(attachments => [...attachments, response.data]);
        Toast.success('Pièce jointe téléchargée avec succès');
        setIsModalVisible(false);
        setFile(null);
        setFileName('');
      }).catch(error => {
        catchError(error);
      });
  };

  const handleFileChange = (event) => {
    if (event.target.files.length > 0) {
      const selectedFile = event.target.files[0];
      setFile(selectedFile);
      const nameWithoutExtension = selectedFile.name.split('.').slice(0, -1).join('.');
      setFileName(nameWithoutExtension.replace(/[-_]/g, ' '));
    } else {
      setFile(null);
      setFileName('');
    }
  };

  const handleDelete = async (uid) => {
    try {
      await PieceJointeService.getInstance().remove(uid);
      setAttachments(attachments.filter(item => item.uid !== uid));
      Toast.success('Pièce jointe supprimée avec succès');
    } catch (error) {
      Toast.error('Erreur lors de la suppression de la pièce jointe');
    }
  };

  return (
    <div className={styles.pieceJointeList}>
      <Modal
        title="Ajouter Pièce Jointe"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        onOk={handleUpload}
      >
        <Form layout="vertical">
          <Divider orientation="left" />
          <Form.Item label="Fichier">
            <div className={styles.uploadContainer} onClick={() => fileInputRef.current.click()}>
              <Space>
              <UploadOutlined className={styles.uploadIcon} />
              <span>{file ? fileName : "Cliquez pour sélectionner un fichier"}</span>
              </Space>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.png,.jpg,.jpeg"
                style={{ display: 'none' }}
              />
            </div>
          </Form.Item>
          <Form.Item label="Nom du fichier">
            <Input value={fileName} onChange={(e) => setFileName(e.target.value)} />
          </Form.Item>
        </Form>
      </Modal>
      {loading ? (
        <Spin />
      ) : (
        <List header={
          <Button icon={<UploadOutlined />} onClick={() => setIsModalVisible(true)}>
            Ajouter une pièce jointe
          </Button>
        }
          itemLayout="horizontal"
          dataSource={attachments}
          renderItem={(item) => (
            <List.Item
              actions={[
                <Popconfirm title="Supprimer" okType='danger'
                  onConfirm={() => handleDelete(item.uid)}>
                  <Button
                    type="text"
                    icon={<DeleteOutlined style={{ color: 'red' }} />}
                  />
                </Popconfirm>,
              ]}
            >
              <List.Item.Meta
                avatar={<FileOutlined style={{ fontSize: '24px', color: '#08c' }} />}
                title={
                  <a href={item.full_path} target="_blank" rel="noreferrer">
                    {item.nom}
                  </a>
                }
                description={<>Ajouté le {<Moment>{item.created_at}</Moment>}</>}
              />
            </List.Item>
          )}
        />
      )}
    </div>
  );
};

export default PieceJointeList;