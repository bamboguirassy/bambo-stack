import { DaoService } from "./DaoService";

export default class PieceJointeService extends DaoService {
    // déclare une constante pour les types : objectif,organisation,user
    static TYPES = {
        OBJECTIF: 'objectif',
        ORGANISATION: 'organisation',
        USER: 'user'
    };

    static getInstance() {
        return super.getInstance('piecejointe');
    }

    findByParent(type, parentId) {
        return PieceJointeService.get(`${this.prefix}/${type}/${parentId}`);
    }

    create(data) {
        return PieceJointeService.upload(`${this.prefix}`, data);
    }
}