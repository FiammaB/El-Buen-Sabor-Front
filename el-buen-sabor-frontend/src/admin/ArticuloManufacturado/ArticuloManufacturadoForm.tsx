import React, { useEffect, useState, useMemo } from 'react';
import { ArticuloManufacturado } from '../../models/Articulos/ArticuloManufacturado';
import { ArticuloManufacturadoDetalle } from '../../models/Articulos/ArticuloManufacturadoDetalle';
import { ArticuloInsumo } from '../../models/Articulos/ArticuloInsumo';
import { Categoria } from '../../models/Categoria/Categoria';
import { Imagen } from '../../models/Categoria/Imagen';
import { ArticuloService } from '../../services/ArticuloService';
import { uploadImage } from '../../services/imagenService';
import axios from 'axios';
import CategoriaForm from '../../components/Categoria/CategoriaForm';

interface ArticuloManufacturadoFormProps {
    articulo?: ArticuloManufacturado | null;
    articulosManufacturados: ArticuloManufacturado[]; // <-- Agregado
    onSave: () => void;
    onCancel: () => void;
}

const ArticuloManufacturadoForm: React.FC<ArticuloManufacturadoFormProps> = ({ articulo, articulosManufacturados, onSave, onCancel }) => {
    const [formData, setFormData] = useState<ArticuloManufacturado>(
        articulo || new ArticuloManufacturado('', 0, 0, '', 0, '', [], undefined, undefined, undefined, undefined, undefined, undefined)
    );

    const [categorias, setCategorias] = useState<Categoria[]>([]);
    const [insumos, setInsumos] = useState<ArticuloInsumo[]>([]);
    const [isUploading, setIsUploading] = useState<boolean>(false);
    const [loadingMasterData, setLoadingMasterData] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const articuloService = useMemo(() => new ArticuloService(), []);

    useEffect(() => {
        const fetchMasterData = async () => {
            try {
                setLoadingMasterData(true);
                const categoriasData = await articuloService.getAllCategorias();
                const insumosData = await articuloService.getAllArticulosInsumo();
                setCategorias(categoriasData);
                setInsumos(insumosData);

                // MAPEAR SOLO AL EDITAR
                if (articulo) {
                    setFormData({
                        ...articulo,
                        categoriaId: articulo.categoriaId ?? articulo.categoria?.id ?? '',
                        detalles: (articulo.detalles || []).map(d => ({
                            id: d.id,
                            cantidad: d.cantidad,
                            articuloInsumoId: d.articuloInsumo?.id ?? d.articuloInsumoId ?? 0,
                            // *** Usar insumosData en vez de insumos ***
                            articuloInsumo: d.articuloInsumo ?? insumosData.find(i => i.id === (d.articuloInsumo?.id ?? d.articuloInsumoId))
                        }))
                    });
                } else {
                    setFormData(new ArticuloManufacturado('', 0, 0, '', 0, '', [], undefined, undefined, undefined, undefined, undefined, undefined));
                }
            } catch (err) {
                setError('Error al cargar datos maestros.');
                console.error(err);
            } finally {
                setLoadingMasterData(false);
            }
        };
        fetchMasterData();
        // SOLO depende de articulo (NO de insumos ni insumos.length)
    }, [articulo, articuloService]);

    const [nombreDuplicado, setNombreDuplicado] = useState(false);

    useEffect(() => {
        if (!formData.denominacion || !articulosManufacturados) {
            setNombreDuplicado(false);
            return;
        }
        const existe = articulosManufacturados
            .filter(a => !formData.id || a.id !== formData.id)
            .some(a => a.denominacion.trim().toLowerCase() === formData.denominacion.trim().toLowerCase());
        setNombreDuplicado(existe);
    }, [formData.denominacion, formData.id, articulosManufacturados]);

    // Cambios para el form principal
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'precioVenta' || name === 'tiempoEstimadoMinutos' ? Number(value) : value,
        }));
    };

    // Subida de imagen a tu backend
    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        setError(null);

        try {
            // Llama a tu servicio, recibe el objeto Imagen del backend
            const response = await uploadImage(file);
            const imagenSubida: Imagen = response.data;
            setFormData(prev => ({
                ...prev,
                imagen: new Imagen(imagenSubida.denominacion, imagenSubida.id)
            }));
        } catch (uploadError) {
            console.error('Error al subir la imagen al backend:', uploadError);
            setError('Error al subir la imagen. Inténtalo de nuevo.');
        } finally {
            setIsUploading(false);
        }
    };

    // --- Manejo de ingredientes (detalles) ---
    const handleDetalleCantidadChange = (index: number, value: string) => {
        const newDetalles = [...formData.detalles];
        newDetalles[index].cantidad = Number(value);
        setFormData(prev => ({ ...prev, detalles: newDetalles }));
    };

    const handleDetalleInsumoChange = (index: number, insumoId: string) => {
        const newDetalles = [...formData.detalles];
        const idNum = Number(insumoId);
        const selectedInsumo = insumos.find(i => i.id === idNum);
        if (isNaN(idNum) || !insumoId) {
            newDetalles[index].articuloInsumoId = 0;
            newDetalles[index].articuloInsumo = undefined;
        } else {
            newDetalles[index].articuloInsumoId = idNum;
            newDetalles[index].articuloInsumo = selectedInsumo;
        }
        setFormData(prev => ({ ...prev, detalles: newDetalles }));
        console.log("Cambio insumo:", index, insumoId, newDetalles);
    };

    const handleAddDetalle = () => {
        setFormData(prev => ({
            ...prev,
            detalles: [...prev.detalles, new ArticuloManufacturadoDetalle(0, 0)],
        }));
    };

    const handleRemoveDetalle = (index: number) => {
        const newDetalles = formData.detalles.filter((_, i) => i !== index);
        setFormData(prev => ({ ...prev, detalles: newDetalles }));
    };

    const calculateCostoTotal = (): number => {
        return formData.detalles.reduce((totalCosto, detalle) => {
            const insumo = insumos.find(i => i.id === detalle.articuloInsumoId);
            return totalCosto + (detalle.cantidad * (insumo?.precioCompra || 0));
        }, 0);
    };

    // ---- Envío del formulario ----
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (formData.detalles.length === 0) {
            setError('El artículo manufacturado debe tener al menos un ingrediente.');
            return;
        }
        if (!formData.denominacion || formData.denominacion.trim() === '') {
            setError('La denominación es obligatoria.');
            return;
        }
        if (formData.precioVenta == null || formData.precioVenta <= 0) {
            setError('El precio de venta debe ser mayor a cero.');
            return;
        }
        if (!formData.categoriaId || Number(formData.categoriaId) === 0) {
            setError('Debe seleccionar una categoría.');
            return;
        }
        if (nombreDuplicado) {
            setError('Ya existe un artículo manufacturado con ese nombre.');
            return;
        }

        // Prepara el payload limpio (sólo IDs, nunca objetos)
        const payload = {
            denominacion: formData.denominacion,
            precioVenta: Number(formData.precioVenta),
            categoriaId: Number(formData.categoriaId) || 0,
            unidadMedidaId: Number(formData.unidadMedidaId) || 0,
            imagenId: formData.imagen?.id || 0,
            descripcion: formData.descripcion,
            tiempoEstimadoMinutos: formData.tiempoEstimadoMinutos,
            preparacion: formData.preparacion,
            detalles: formData.detalles.map(d => ({
                id: d.id ?? undefined,
                cantidad: d.cantidad,
                articuloInsumoId: Number(d.articuloInsumoId)
            }))
        };

        console.log("Payload limpio:", payload);

        try {
            if (formData.id) {
                await articuloService.updateArticuloManufacturado(formData.id, payload);
                alert('Artículo manufacturado actualizado exitosamente.');
                setFormData(new ArticuloManufacturado('', 0, 0, '', 0, '', [], undefined, undefined, undefined, undefined, undefined, undefined));
                onSave();
            } else {
                await articuloService.createArticuloManufacturado(payload);
                alert('Artículo manufacturado creado exitosamente.');
            }

            onSave();
        } catch (err) {
            let errorMessage = 'Error desconocido al guardar el artículo.';
            if (axios.isAxiosError(err)) {
                if (err.response?.data) {
                    if (typeof err.response.data === 'string') {
                        errorMessage = err.response.data;
                    } else if (err.response.data instanceof Object && 'message' in err.response.data) {
                        errorMessage = (err.response.data as { message: string }).message;
                    } else {
                        errorMessage = JSON.stringify(err.response.data);
                    }
                } else if (err.message) {
                    errorMessage = err.message;
                }
            } else if (err instanceof Error) {
                errorMessage = err.message;
            }
            setError(`Error al guardar el artículo: ${errorMessage}`);
            console.error(err);
        }

        if (formData.detalles.some(d => !d.articuloInsumoId || d.articuloInsumoId === 0)) {
            setError('Todos los ingredientes deben tener un insumo seleccionado.');
            return;
        }

    };

    if (loadingMasterData) return <p>Cargando datos del formulario...</p>;
    if (error) return <p style={{ color: 'red' }}>{error}</p>;
    return (
        <div className="articulo-manufacturado-form" style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '8px', backgroundColor: '#f9f9f9' }}>
            <h3>{articulo?.id ? 'Editar Artículo Manufacturado' : 'Crear Nuevo Artículo Manufacturado'}</h3>
            <form onSubmit={handleSubmit}>
                {/* Campos del formulario principal */}
                <div style={{ marginBottom: '15px' }}>
                    <label>Denominación:</label>
                    <input type="text" name="denominacion" value={formData.denominacion} onChange={handleChange} required style={{ width: '100%', padding: '8px' }} />
                    {nombreDuplicado && (
                        <div style={{ color: "red", marginTop: 4, fontSize: 14 }}>
                            "Ya existe un artículo manufacturado con ese nombre."
                        </div>
                    )}
                </div>
                <div style={{ marginBottom: '15px' }}>
                    <label>Precio Venta:</label>
                    <input type="number" name="precioVenta" value={formData.precioVenta} onChange={handleChange} required min="0.01" step="0.01" style={{ width: '100%', padding: '8px' }} />
                </div>
                <div style={{ marginBottom: '15px' }}>
                    <label>Descripción:</label>
                    <textarea name="descripcion" value={formData.descripcion} onChange={handleChange} style={{ width: '100%', padding: '8px' }} />
                </div>
                <div style={{ marginBottom: '15px' }}>
                    <label>Tiempo Estimado (minutos):</label>
                    <input type="number" name="tiempoEstimadoMinutos" value={formData.tiempoEstimadoMinutos} onChange={handleChange} required min="0" style={{ width: '100%', padding: '8px' }} />
                </div>
                <div style={{ marginBottom: '15px' }}>
                    <label>Preparación:</label>
                    <textarea name="preparacion" value={formData.preparacion} onChange={handleChange} style={{ width: '100%', padding: '8px' }} />
                </div>

                {/* Selector de Categoría */}
                <div style={{ marginBottom: '15px' }}>
                    <label>Categoría:</label>
                    <select name="categoriaId" value={formData.categoriaId} onChange={handleChange} required style={{ width: '100%', padding: '8px' }}>
                        <option value="">Seleccione una categoría</option>
                        {categorias.map(cat => (
                            <option key={cat.id} value={cat.id}>
                                {cat.denominacion}
                            </option>
                        ))}
                    </select>
                    <p id='createCategory' className='create-category-btn'>Crear categoria +</p>
                </div>

                {/* Campo para URL de Imagen (ahora es un input de texto) */}
                <div style={{marginBottom: '15px'}}>
                    <label>Imagen del Artículo:</label>
                    <input
                        type="file"
                        accept="image/*" // Aceptar solo archivos de imagen
                        onChange={handleImageUpload}
                        style={{ width: '100%', padding: '8px' }}
                        disabled={isUploading} // Deshabilitar mientras se sube
                    />
                    {isUploading && <p>Subiendo imagen...</p>}
                    {/* Previsualización de la imagen subida */}
                    {formData.imagen?.denominacion && (
                        <div style={{ marginTop: '10px' }}>
                    {formData.imagen?.denominacion && ( // Mostrar previsualización si hay URL
                        <div style={{marginTop: '10px'}}>
                            <img src={formData.imagen.denominacion} alt="Previsualización" style={{
                                maxWidth: '150px',
                                maxHeight: '150px',
                                objectFit: 'cover',
                                border: '1px solid #ccc'
                            }}/>
                            <p style={{fontSize: '0.8em', color: '#555'}}>URL: {formData.imagen.denominacion}</p>
                        </div>
                    )}
                        </div>
                    )}
                </div>
                    {/* Sección de Detalles (Ingredientes) */}
                        <hr style={{margin: '20px 0'}} />
                <h4>Ingredientes:</h4>
                {formData.detalles.map((detalle, index) => (
                    <div key={detalle.id ?? `tmp-${index}`} style={{border: '1px dashed #ccc', padding: '10px', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <label>Insumo:</label>
                    <select
                        value={detalle.articuloInsumoId ? String(detalle.articuloInsumoId) : ""}
                        onChange={e => handleDetalleInsumoChange(index, e.target.value)}
                        required
                        style={{ flex: 1, padding: '8px' }}
                    >
                        <option value="">Seleccione un insumo</option>
                        {insumos.map((ins) => (
                            <option key={ins.id ?? `tmp-${ins.denominacion}`} value={ins.id ?? ""}>
                                {ins.denominacion} ({ins.unidadMedida?.denominacion})
                            </option>
                        ))}
                    </select>
                        <label>Cantidad:</label>
                        <input
                            type="number"
                            value={detalle.cantidad}
                            onChange={(e) => handleDetalleCantidadChange(index, e.target.value)}
                            required
                            min="0.01"
                            step="0.01"
                            style={{ width: '80px', padding: '8px' }}
                        />
                        <button type="button" onClick={() => handleRemoveDetalle(index)} style={{ padding: '8px 12px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                            Eliminar
                        </button>
                    </div>
                ))}

                <div className='flex gap-4 justify-center'>
                    {/* <button type="button" onClick={handleCreateIngrediente} style={{ padding: '10px 15px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginBottom: '15px' }}>
                        Crear Ingrediente
                    </button> */}
                    <button type="button" onClick={handleAddDetalle} style={{ padding: '10px 15px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginBottom: '15px' }}>
                        Añadir Ingrediente
                    </button>
                </div>

                {/* Costo Total del Producto */}
                <div style={{ marginTop: '20px', padding: '10px', borderTop: '1px solid #eee', fontSize: '1.1em', fontWeight: 'bold' }}>
                    Costo Total del Producto: ${calculateCostoTotal().toFixed(2)}
                </div>

                {/* Botones de acción */}
                {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}
                <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
                    <button type="submit" disabled={isUploading} style={{ padding: '10px 20px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                        {isUploading ? 'Espere...' : (formData.id ? 'Actualizar' : 'Guardar')}
                    </button>
                    <button type="button" onClick={onCancel} disabled={isUploading} style={{ padding: '10px 20px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                        Cancelar
                    </button>
                </div>
            </form>
            <CategoriaForm
                categorias={categorias}
                reloadCategorias={async () => {
                    const updated = await articuloService.getAllCategorias();
                    setCategorias(updated);
                }}
            />
        </div>
    );
};

export default ArticuloManufacturadoForm;