import type { ICategoriaResponseDTO } from "../../models/DTO/ICategoriaResponseDTO.ts";
import { useEffect, useRef, useState } from "react";

function normalizarTexto(texto: string): string {
	return texto
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.replace(/\s+/g, '')
		.toLowerCase();
}

export function CategoriaForm({
								  idCategoriaPadre,
								  reloadCategorias,
								  onClose,
								  editCategoria,
								  categoriasExistentes = []
							  }: {
	idCategoriaPadre: number,
	reloadCategorias: () => void,
	onClose: () => void,
	editCategoria?: ICategoriaResponseDTO | null,
	categoriasExistentes?: ICategoriaResponseDTO[]
}) {
	const [denominacion, setDenominacion] = useState(editCategoria?.denominacion || "");
	const [loading, setLoading] = useState(false);
	const wrapperRef = useRef<HTMLDivElement>(null);
	const [baja, setBaja] = useState(editCategoria?.baja ?? false);
	const [errorNombre, setErrorNombre] = useState<string | null>(null);

	useEffect(() => {
		setDenominacion(editCategoria?.denominacion || "");
	}, [editCategoria]);

	// Validación reactiva al escribir
	useEffect(() => {
		const nombreNormalizado = normalizarTexto(denominacion);
		const existe = categoriasExistentes
			.filter(cat => !editCategoria || cat.id !== editCategoria.id)
			.some(cat => normalizarTexto(cat.denominacion || "") === nombreNormalizado);

		if (existe) {
			setErrorNombre("Ya existe una categoría con ese nombre.");
		} else {
			setErrorNombre(null);
		}
	}, [denominacion, categoriasExistentes, editCategoria]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (errorNombre) return; // Bloquea si ya existe

		setLoading(true);

		const data = {
			denominacion,
			categoriaPadreId: idCategoriaPadre,
			sucursalIds: [],
			baja: false
		};

		try {
			let res;
			let categoriaCreada = null;
			if (editCategoria) {
				const dataEdit = { denominacion, categoriaPadreId: idCategoriaPadre, sucursalIds: [] };
				res = await fetch(`http://localhost:8080/api/categorias/${editCategoria.id}`, {
					method: "PUT",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify(dataEdit)
				});
			} else {
				res = await fetch("http://localhost:8080/api/categorias", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ ...data, baja })
				});
				if (res.ok) {
					categoriaCreada = await res.json();
					if (baja) {
						await fetch(`http://localhost:8080/api/categorias/${categoriaCreada.id}/baja?baja=true`, {
							method: "PATCH"
						});
					}
				}
			}

			if (res.ok) {
				reloadCategorias();
				onClose();
			} else {
				alert("Error al guardar la categoría");
			}
		} catch (e) {
			alert("Error de red");
		} finally {
			setLoading(false);
		}
	};

	const handleDenominacionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const valor = e.target.value;
		// Solo letras, espacios y tildes (mayúsculas o minúsculas)
		if (/^[A-Za-zÁÉÍÓÚáéíóúÑñüÜ\s]*$/.test(valor)) {
			setDenominacion(valor);
		}
	};

	return (
		<div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
			<div ref={wrapperRef} className="bg-white rounded-xl shadow-lg p-8 min-w-[300px] w-full max-w-md">
				<h3 className="text-xl font-semibold mb-4">
					{editCategoria ? "Editar Categoría" : "Nueva Categoría"}
				</h3>
				<form onSubmit={handleSubmit} className="flex flex-col gap-4">
					<label className="flex flex-col gap-1">
						<span className="font-semibold">Nombre</span>
						<input
							type="text"
							value={denominacion}
							onChange={handleDenominacionChange}
							required
							className="border rounded p-2"
							disabled={loading}
						/>
						{errorNombre && (
							<span className="text-red-500 text-sm mt-1">{errorNombre}</span>
						)}
					</label>
					{!editCategoria && (
						<label className="flex flex-col gap-1">
							<span className="font-semibold">Estado</span>
							<select
								value={baja ? "inactiva" : "activa"}
								onChange={e => setBaja(e.target.value === "inactiva")}
								className="border rounded p-2"
								disabled={loading}
							>
								<option value="activa">Activa</option>
								<option value="inactiva">Inactiva</option>
							</select>
						</label>
					)}
					<button
						type="submit"
						disabled={loading || !!errorNombre || !denominacion.trim()}
						className="bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-800"
					>
						{editCategoria ? "Guardar cambios" : "Crear categoría"}
					</button>
					<button
						type="button"
						onClick={onClose}
						className="text-gray-500 hover:text-red-600 text-sm"
						disabled={loading}
					>
						Cancelar
					</button>
				</form>
			</div>
		</div>
	);
}