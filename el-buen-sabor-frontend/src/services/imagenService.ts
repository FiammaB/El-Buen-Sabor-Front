import axios from 'axios';
import type { Imagen } from '../models/Articulos/Imagen';
import { API_ORIGIN } from "../config/api";

const API_URL = `${API_ORIGIN}/api/imagenes`;

export const uploadImage = (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    return axios.post<Imagen>(`${API_URL}/upload`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
};