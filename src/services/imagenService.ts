import axios from 'axios';
import type { Imagen } from '../models/Articulos/Imagen';

const API_URL = 'http://localhost:8080/api/imagenes';

export const uploadImage = (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    return axios.post<Imagen>(`${API_URL}/upload`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
};