import { useState, useEffect } from 'react';
import {
  Title, Text, Button, Badge, Table, Group, ActionIcon,
  Menu, Drawer, ScrollArea, TextInput, Textarea, Grid,
  Modal, Select, Stack, Alert, Tabs, Stepper, Checkbox, Divider, Paper
} from '@mantine/core';
import { Dropzone, PDF_MIME_TYPE } from '@mantine/dropzone';
import {
  FileUp, Search, MoreVertical, Eye, Edit3,
  FileSpreadsheet, Bot, Check, Info, FolderOpen, ClipboardCheck,
  ListChecks, FileSearch, AlertTriangle, Sparkles, Building2, MapPin,
  Calendar, Gavel, ShieldCheck, Activity, Target, Hash
} from 'lucide-react';
import { notifications } from '@mantine/notifications';
import { api } from '../../api/axiosConfig';

// ============================================================
// INTERFACES
// ============================================================

interface Oficio {
  id?: string;
  nroOficio: string;
  fechaIngreso?: string;
  institucion: string;
  region: string;
  residenciaCentro?: string;
  nivel?: string;
  dimension: string;
  nudoCritico: string;
  tipoRecomendacion?: string;
  tiempo?: string;
  descripcion?: string;
  estado: 'PENDIENTE' | 'EN CURSO' | 'CERRADO';

  profesionalResponsable?: string;
  accionRecomendada?: string;
  accionRecomendada2?: string;
  acoge?: string;
  faseSeguimiento?: string;
  responsableSeguimiento?: string;
  otrasAccionesDdn?: string;

  evaluacionCumplimiento?: string;
  correlativo?: string;
  gv?: string;
  verbo?: string;
  materia?: string;
  categoria?: string;
  tipoSeguimiento?: string;
  fechaSeguimiento?: string;
  otroSeguimientoInstitucional?: string;
  fechaRespuesta?: string;
  tipoRespuesta?: string;
  valoracionRubrica?: string;
}

interface EvaluacionItem {
  id: number;
  confianzaMatch: number;
  razonamiento: string;
  evaluacionCumplimiento?: string;
  correlativo?: string;
  gv?: string;
  verbo?: string;
  materia?: string;
  categoria?: string;
  tipoSeguimiento?: string;
  fechaSeguimiento?: string;
  otroSeguimientoInstitucional?: string;
  fechaRespuesta?: string;
  tipoRespuesta?: string;
  valoracionRubrica?: string;
}

interface EvaluacionResponse {
  evaluadas: EvaluacionItem[];
  sinMatch: number[];
}

// ============================================================
// CONSTANTES Y HELPERS
// ============================================================

const VALORACION_OPTIONS = [
  'Cumplimiento Total',
  'Cumplimiento Parcial Sustancial',
  'Cumplimiento Parcial',
  'Incumplimiento',
  'No hay información',
  'No aplica'
];

const getEstadoColor = (estado: string) => {
  if (estado === 'PENDIENTE') return 'yellow';
  if (estado === 'EN CURSO') return 'blue';
  return 'teal';
};

const getValoracionColor = (val?: string) => {
  if (!val) return 'gray';
  if (val === 'Cumplimiento Total') return 'teal';
  if (val === 'Cumplimiento Parcial Sustancial') return 'lime';
  if (val === 'Cumplimiento Parcial') return 'yellow';
  if (val === 'Incumplimiento') return 'red';
  if (val === 'No hay información') return 'gray';
  if (val === 'No aplica') return 'gray';
  return 'gray';
};

const getValoracionGradient = (val?: string): string | undefined => {
  if (!val) return undefined;
  const colorMap: Record<string, string> = {
    'Cumplimiento Total': 'rgba(20, 184, 166, 0.35)',
    'Cumplimiento Parcial Sustancial': 'rgba(132, 204, 22, 0.30)',
    'Cumplimiento Parcial': 'rgba(234, 179, 8, 0.30)',
    'Incumplimiento': 'rgba(239, 68, 68, 0.30)',
    'No hay información': 'rgba(156, 163, 175, 0.20)',
    'No aplica': 'rgba(209, 213, 219, 0.25)'
  };
  const color = colorMap[val];
  if (!color) return undefined;
  return `linear-gradient(to right, ${color} 0%, ${color} 15%, transparent 50%)`;
};

const getConfianzaColor = (conf: number) => {
  if (conf >= 0.8) return 'teal';
  if (conf >= 0.6) return 'yellow';
  return 'red';
};

const formatDate = (d?: string) => {
  if (!d) return null;
  try {
    const date = new Date(d);
    if (isNaN(date.getTime())) return d;
    return date.toLocaleDateString('es-CL', { day: '2-digit', month: '2-digit', year: 'numeric' });
  } catch {
    return d;
  }
};

// ============================================================
// SUBCOMPONENTE: CAMPO DE LECTURA EN LA FICHA
// ============================================================

const FieldRow = ({ label, value, mono = false }: { label: string; value?: string | null; mono?: boolean }) => (
  <div>
    <Text size="xs" c="dimmed" tt="uppercase" fw={700} mb={2} style={{ letterSpacing: 0.4 }}>{label}</Text>
    <Text size="sm" fw={500} className={mono ? 'font-mono' : ''}>
      {value && value.toString().trim() ? value : <Text span c="dimmed" fs="italic" size="sm">Sin información</Text>}
    </Text>
  </div>
);

// ============================================================
// COMPONENTE: DRAWER DE INGESTA IA (PDF inicial)
// ============================================================

const IngestaDrawerContent = ({ onClose, onIngestaExitosa }: { onClose: () => void; onIngestaExitosa: () => void }) => {
  const [file, setFile] = useState<File | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [extractedData, setExtractedData] = useState<Partial<Oficio> | null>(null);

  const handleExtraccion = async () => {
    if (!file) return;
    setIsExtracting(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await api.post('/sgs/procesar-pdf', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setExtractedData(response.data);
      notifications.show({ title: 'Extracción exitosa', message: 'IA procesó el documento.', color: 'teal', icon: <Check size={16} /> });
    } catch {
      notifications.show({ title: 'Error', message: 'No se pudo procesar el documento.', color: 'red' });
    } finally {
      setIsExtracting(false);
    }
  };

  const handleGuardar = async () => {
    if (!extractedData) return;
    setIsSaving(true);
    try {
      await api.post('/sgs/guardar', extractedData);
      notifications.show({ title: 'Oficio guardado', message: 'Registro ingresado a la matriz.', color: 'teal' });
      onIngestaExitosa();
      onClose();
    } catch {
      notifications.show({ title: 'Error al guardar', message: 'No se pudo registrar en la BD.', color: 'red' });
    } finally {
      setIsSaving(false);
    }
  };

  if (!extractedData) {
    return (
      <Stack h="100%" gap="md">
        <Alert color="teal" variant="light" icon={<Sparkles size={16} />}>
          Sube el oficio en PDF. La IA extraerá región, institución, nudo crítico, recomendaciones y plazos automáticamente.
        </Alert>
        <Dropzone
          onDrop={(files) => setFile(files[0])}
          accept={PDF_MIME_TYPE}
          className={`border-2 border-dashed rounded-xl p-10 transition-all ${file ? 'border-teal-500 bg-teal-50' : 'border-gray-300 hover:border-teal-400'}`}
        >
          <Group justify="center" gap="xl" style={{ pointerEvents: 'none' }}>
            <Dropzone.Idle><FileUp size={50} className={file ? 'text-teal-500' : 'text-gray-400'} /></Dropzone.Idle>
            <div>
              <Text size="xl" inline fw={700}>{file ? file.name : 'Arrastra el PDF aquí'}</Text>
              <Text size="sm" c="dimmed" inline mt={7}>O haz click para seleccionar. Máximo 10MB.</Text>
            </div>
          </Group>
        </Dropzone>
        <Group justify="flex-end" mt="auto">
          <Button variant="default" onClick={onClose}>Cancelar</Button>
          <Button color="teal" leftSection={<Bot size={18} />} disabled={!file} loading={isExtracting} onClick={handleExtraccion}>Analizar con IA</Button>
        </Group>
      </Stack>
    );
  }

  return (
    <Stack h="100%" gap="md">
      <Alert color="teal" variant="light" icon={<ShieldCheck size={16} />}>
        Revisa los campos extraídos. Corrige cualquier error antes de confirmar el guardado.
      </Alert>
      <ScrollArea className="flex-1 pr-2">
        <Grid>
          <Grid.Col span={4}><TextInput label="N° Oficio" required value={extractedData.nroOficio || ''} onChange={(e) => setExtractedData({ ...extractedData, nroOficio: e.target.value })} /></Grid.Col>
          <Grid.Col span={4}><TextInput label="Región" value={extractedData.region || ''} onChange={(e) => setExtractedData({ ...extractedData, region: e.target.value })} /></Grid.Col>
          <Grid.Col span={4}><TextInput label="Nivel" value={extractedData.nivel || ''} onChange={(e) => setExtractedData({ ...extractedData, nivel: e.target.value })} /></Grid.Col>
          <Grid.Col span={8}><TextInput label="Institución requerida" required value={extractedData.institucion || ''} onChange={(e) => setExtractedData({ ...extractedData, institucion: e.target.value })} /></Grid.Col>
          <Grid.Col span={4}><TextInput label="Residencia / Centro" value={extractedData.residenciaCentro || ''} onChange={(e) => setExtractedData({ ...extractedData, residenciaCentro: e.target.value })} /></Grid.Col>
          <Grid.Col span={6}><TextInput label="Dimensión" value={extractedData.dimension || ''} onChange={(e) => setExtractedData({ ...extractedData, dimension: e.target.value })} /></Grid.Col>
          <Grid.Col span={6}><TextInput label="Tipo de recomendación" value={extractedData.tipoRecomendacion || ''} onChange={(e) => setExtractedData({ ...extractedData, tipoRecomendacion: e.target.value })} /></Grid.Col>
          <Grid.Col span={12}><TextInput label="Tiempo / Plazo" value={extractedData.tiempo || ''} onChange={(e) => setExtractedData({ ...extractedData, tiempo: e.target.value })} /></Grid.Col>
          <Grid.Col span={12}><Textarea label="Nudo crítico" rows={3} value={extractedData.nudoCritico || ''} onChange={(e) => setExtractedData({ ...extractedData, nudoCritico: e.target.value })} /></Grid.Col>
          <Grid.Col span={12}><Textarea label="Descripción" rows={4} value={extractedData.descripcion || ''} onChange={(e) => setExtractedData({ ...extractedData, descripcion: e.target.value })} /></Grid.Col>
        </Grid>
      </ScrollArea>
      <Group justify="space-between" pt="md" className="border-t">
        <Button variant="default" onClick={() => setExtractedData(null)}>Atrás</Button>
        <Button color="teal" leftSection={<Check size={16} />} loading={isSaving} onClick={handleGuardar}>Confirmar y guardar</Button>
      </Group>
    </Stack>
  );
};

// ============================================================
// COMPONENTE: DRAWER DE EVALUACIÓN DE CUMPLIMIENTO
// ============================================================

const EvaluacionDrawerContent = ({
  oficios,
  onClose,
  onEvaluacionExitosa
}: {
  oficios: Oficio[];
  onClose: () => void;
  onEvaluacionExitosa: () => void;
}) => {
  const [step, setStep] = useState(0);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [result, setResult] = useState<EvaluacionResponse | null>(null);
  const [discardedIds, setDiscardedIds] = useState<Set<number>>(new Set());

  const evaluables = oficios.filter(
    o => o.id && (o.estado === 'PENDIENTE' || o.estado === 'EN CURSO')
  );

  const filtered = evaluables.filter(o =>
    o.nroOficio.toLowerCase().includes(searchQuery.toLowerCase()) ||
    o.institucion.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (o.nudoCritico || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleId = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const toggleAllVisible = () => {
    const visibleIds = filtered.map(o => o.id!);
    const allSelected = visibleIds.every(id => selectedIds.includes(id));
    if (allSelected) {
      setSelectedIds(prev => prev.filter(id => !visibleIds.includes(id)));
    } else {
      setSelectedIds(prev => Array.from(new Set([...prev, ...visibleIds])));
    }
  };

  const handleProcesarPdf = async () => {
    if (!file || selectedIds.length === 0) return;
    setIsProcessing(true);
    const formData = new FormData();
    formData.append('file', file);
    selectedIds.forEach(id => formData.append('ids', id));

    try {
      const response = await api.post('/sgs/procesar-respuesta', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setResult(response.data);
      setStep(2);
      notifications.show({
        title: 'Procesamiento exitoso',
        message: `IA evaluó ${response.data.evaluadas.length} oficios.`,
        color: 'teal',
        icon: <Check size={16} />
      });
    } catch (error: any) {
      notifications.show({
        title: 'Error en evaluación',
        message: error?.response?.data?.error || 'No se pudo procesar el oficio de respuesta.',
        color: 'red'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAplicar = async () => {
    if (!result) return;
    const aPersistir = result.evaluadas.filter(e => !discardedIds.has(e.id));
    if (aPersistir.length === 0) {
      notifications.show({ title: 'Nada para guardar', message: 'Todos los items fueron descartados.', color: 'yellow' });
      return;
    }

    setIsSaving(true);
    try {
      await api.put('/sgs/evaluacion-masiva', aPersistir);
      notifications.show({
        title: 'Evaluación aplicada',
        message: `${aPersistir.length} oficios actualizados con cumplimiento.`,
        color: 'teal'
      });
      onEvaluacionExitosa();
      onClose();
    } catch (error: any) {
      notifications.show({
        title: 'Error al persistir',
        message: error?.response?.data?.error || 'No se pudo aplicar la evaluación.',
        color: 'red'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const updateEvaluacion = (id: number, field: keyof EvaluacionItem, value: any) => {
    if (!result) return;
    setResult({
      ...result,
      evaluadas: result.evaluadas.map(e => e.id === id ? { ...e, [field]: value } : e)
    });
  };

  const toggleDiscard = (id: number) => {
    setDiscardedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <Stack h="100%" gap="md">
      <Stepper active={step} onStepClick={setStep} color="violet" size="sm">
        <Stepper.Step label="Seleccionar" description="Oficios a evaluar" icon={<ListChecks size={16} />} allowStepSelect={step > 0} />
        <Stepper.Step label="Subir respuesta" description="PDF institucional" icon={<FileSearch size={16} />} allowStepSelect={step > 1 && selectedIds.length > 0} />
        <Stepper.Step label="Revisar" description="Resultados IA" icon={<ClipboardCheck size={16} />} allowStepSelect={false} />
      </Stepper>

      {step === 0 && (
        <Stack className="flex-1" gap="sm">
          <Alert color="violet" variant="light" icon={<Info size={16} />}>
            Selecciona los oficios cuyo cumplimiento se evaluará con el oficio de respuesta institucional.
          </Alert>

          <Group justify="space-between">
            <TextInput
              placeholder="Buscar por N° oficio, institución o nudo crítico..."
              leftSection={<Search size={14} />}
              value={searchQuery}
              onChange={e => setSearchQuery(e.currentTarget.value)}
              className="flex-1"
            />
            <Button variant="subtle" size="sm" onClick={toggleAllVisible}>Alternar visibles</Button>
          </Group>

          <Text size="xs" c="dimmed">{selectedIds.length} seleccionados de {evaluables.length} disponibles</Text>

          <ScrollArea className="flex-1 border rounded">
            <Table verticalSpacing="xs">
              <Table.Thead className="bg-gray-50">
                <Table.Tr>
                  <Table.Th style={{ width: 40 }}></Table.Th>
                  <Table.Th>N° Oficio</Table.Th>
                  <Table.Th>Institución</Table.Th>
                  <Table.Th>Nudo crítico</Table.Th>
                  <Table.Th>Estado</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {filtered.map(o => (
                  <Table.Tr key={o.id} className="cursor-pointer hover:bg-violet-50/40" onClick={() => toggleId(o.id!)}>
                    <Table.Td><Checkbox checked={selectedIds.includes(o.id!)} onChange={() => toggleId(o.id!)} color="violet" /></Table.Td>
                    <Table.Td><Text size="sm" fw={700}>{o.nroOficio}</Text></Table.Td>
                    <Table.Td><Text size="sm">{o.institucion}</Text></Table.Td>
                    <Table.Td className="max-w-[300px]"><Text size="xs" c="dimmed" lineClamp={2}>{o.nudoCritico}</Text></Table.Td>
                    <Table.Td><Badge size="xs" color={getEstadoColor(o.estado)} variant="light">{o.estado}</Badge></Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </ScrollArea>

          <Group justify="flex-end" pt="md" className="border-t">
            <Button variant="default" onClick={onClose}>Cancelar</Button>
            <Button color="violet" disabled={selectedIds.length === 0} onClick={() => setStep(1)} rightSection={<FileSearch size={16} />}>
              Continuar ({selectedIds.length})
            </Button>
          </Group>
        </Stack>
      )}

      {step === 1 && (
        <Stack className="flex-1">
          <Alert color="violet" variant="light" icon={<Info size={16} />}>
            Sube el oficio de respuesta enviado por la institución fiscalizada. La IA cruzará semánticamente cada recomendación con su respuesta.
          </Alert>

          <Badge color="violet" variant="light" size="lg" w="fit-content">
            {selectedIds.length} oficios seleccionados para evaluar
          </Badge>

          <Dropzone
            onDrop={files => setFile(files[0])}
            accept={PDF_MIME_TYPE}
            className={`border-2 border-dashed rounded-xl p-10 transition-all ${file ? 'border-violet-500 bg-violet-50' : 'border-gray-300 hover:border-violet-400'}`}
          >
            <Group justify="center" gap="xl" style={{ pointerEvents: 'none' }}>
              <Dropzone.Idle><FileUp size={50} className={file ? 'text-violet-500' : 'text-gray-400'} /></Dropzone.Idle>
              <div>
                <Text size="xl" inline fw={700}>{file ? file.name : 'Arrastra el PDF de respuesta aquí'}</Text>
                <Text size="sm" c="dimmed" inline mt={7}>Máximo 10MB.</Text>
              </div>
            </Group>
          </Dropzone>

          <Group justify="space-between" mt="auto" pt="md" className="border-t">
            <Button variant="default" onClick={() => setStep(0)}>Atrás</Button>
            <Button color="violet" leftSection={<Bot size={16} />} disabled={!file} loading={isProcessing} onClick={handleProcesarPdf}>
              Evaluar con IA
            </Button>
          </Group>
        </Stack>
      )}

      {step === 2 && result && (
        <Stack className="flex-1">
          <Group>
            <Badge color="teal" size="lg" variant="light">{result.evaluadas.length} evaluadas</Badge>
            {result.sinMatch.length > 0 && <Badge color="orange" size="lg" variant="light">{result.sinMatch.length} sin match</Badge>}
            {discardedIds.size > 0 && <Badge color="gray" size="lg" variant="light">{discardedIds.size} descartados</Badge>}
          </Group>

          {result.sinMatch.length > 0 && (
            <Alert color="orange" variant="light" icon={<AlertTriangle size={16} />}>
              La IA no encontró correspondencia clara para los oficios con ID:{' '}
              <Text span fw={700}>{result.sinMatch.join(', ')}</Text>. Estos no serán actualizados.
            </Alert>
          )}

          <ScrollArea className="flex-1 pr-2">
            <Stack gap="md">
              {result.evaluadas.map(item => {
                const oficio = oficios.find(o => Number(o.id) === item.id);
                const isDiscarded = discardedIds.has(item.id);
                return (
                  <div key={item.id} className={`border rounded-lg p-4 transition-opacity ${isDiscarded ? 'opacity-40 bg-gray-50' : 'bg-white'}`}>
                    <Group justify="space-between" mb="xs">
                      <Group gap="xs">
                        <Text size="sm" fw={700}>{oficio?.nroOficio || `ID ${item.id}`}</Text>
                        <Badge color={getConfianzaColor(item.confianzaMatch)} size="sm" variant="light">
                          Confianza: {(item.confianzaMatch * 100).toFixed(0)}%
                        </Badge>
                        {item.valoracionRubrica && (
                          <Badge color={getValoracionColor(item.valoracionRubrica)} size="sm">
                            {item.valoracionRubrica}
                          </Badge>
                        )}
                      </Group>
                      <Button variant="subtle" size="xs" color={isDiscarded ? 'teal' : 'red'} onClick={() => toggleDiscard(item.id)}>
                        {isDiscarded ? 'Restaurar' : 'Descartar'}
                      </Button>
                    </Group>

                    {oficio?.nudoCritico && (
                      <Text size="xs" c="dimmed" mb="xs" lineClamp={2}><strong>Nudo:</strong> {oficio.nudoCritico}</Text>
                    )}

                    <Alert color="blue" variant="light" p="xs" mb="sm">
                      <Text size="xs"><strong>Razonamiento IA:</strong> {item.razonamiento}</Text>
                    </Alert>

                    {!isDiscarded && (
                      <Grid>
                        <Grid.Col span={6}><Select label="Valoración rúbrica" data={VALORACION_OPTIONS} value={item.valoracionRubrica || null} onChange={val => updateEvaluacion(item.id, 'valoracionRubrica', val)} size="xs" /></Grid.Col>
                        <Grid.Col span={6}><TextInput label="Tipo de respuesta" value={item.tipoRespuesta || ''} onChange={e => updateEvaluacion(item.id, 'tipoRespuesta', e.target.value)} size="xs" /></Grid.Col>
                        <Grid.Col span={4}><TextInput label="Verbo" value={item.verbo || ''} onChange={e => updateEvaluacion(item.id, 'verbo', e.target.value)} size="xs" /></Grid.Col>
                        <Grid.Col span={4}><TextInput label="Materia" value={item.materia || ''} onChange={e => updateEvaluacion(item.id, 'materia', e.target.value)} size="xs" /></Grid.Col>
                        <Grid.Col span={4}><TextInput label="Categoría" value={item.categoria || ''} onChange={e => updateEvaluacion(item.id, 'categoria', e.target.value)} size="xs" /></Grid.Col>
                        <Grid.Col span={4}><TextInput label="Tipo seguimiento" value={item.tipoSeguimiento || ''} onChange={e => updateEvaluacion(item.id, 'tipoSeguimiento', e.target.value)} size="xs" /></Grid.Col>
                        <Grid.Col span={4}><TextInput type="date" label="Fecha seguimiento" value={item.fechaSeguimiento || ''} onChange={e => updateEvaluacion(item.id, 'fechaSeguimiento', e.target.value)} size="xs" /></Grid.Col>
                        <Grid.Col span={4}><TextInput type="date" label="Fecha respuesta" value={item.fechaRespuesta || ''} onChange={e => updateEvaluacion(item.id, 'fechaRespuesta', e.target.value)} size="xs" /></Grid.Col>
                        <Grid.Col span={3}><TextInput label="Correlativo" value={item.correlativo || ''} onChange={e => updateEvaluacion(item.id, 'correlativo', e.target.value)} size="xs" /></Grid.Col>
                        <Grid.Col span={3}><TextInput label="GV" value={item.gv || ''} onChange={e => updateEvaluacion(item.id, 'gv', e.target.value)} size="xs" /></Grid.Col>
                        <Grid.Col span={6}><TextInput label="Otro seguimiento institucional" value={item.otroSeguimientoInstitucional || ''} onChange={e => updateEvaluacion(item.id, 'otroSeguimientoInstitucional', e.target.value)} size="xs" /></Grid.Col>
                        <Grid.Col span={12}><TextInput label="Evaluación de cumplimiento (resumen)" value={item.evaluacionCumplimiento || ''} onChange={e => updateEvaluacion(item.id, 'evaluacionCumplimiento', e.target.value)} size="xs" /></Grid.Col>
                      </Grid>
                    )}
                  </div>
                );
              })}
            </Stack>
          </ScrollArea>

          <Group justify="space-between" pt="md" className="border-t">
            <Button variant="default" onClick={() => setStep(1)}>Atrás</Button>
            <Button color="violet" leftSection={<Check size={16} />} loading={isSaving} onClick={handleAplicar}>
              Aplicar a {result.evaluadas.length - discardedIds.size} oficios
            </Button>
          </Group>
        </Stack>
      )}
    </Stack>
  );
};

// ============================================================
// COMPONENTE PRINCIPAL: DASHBOARD
// ============================================================

export const SgsDashboard = () => {
  const [oficios, setOficios] = useState<Oficio[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOficio, setSelectedOficio] = useState<Oficio | null>(null);

  const [isAiDrawerOpen, setIsAiDrawerOpen] = useState(false);
  const [isEvaluacionDrawerOpen, setIsEvaluacionDrawerOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const fetchOficios = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/sgs/');
      setOficios(response.data);
    } catch (error) {
      console.error('Error cargando oficios', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchOficios(); }, []);

  const filteredOficios = oficios.filter(o =>
    o.nroOficio.toLowerCase().includes(searchQuery.toLowerCase()) ||
    o.institucion.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalEvaluados = oficios.filter(o => !!o.valoracionRubrica).length;

  const handleUpdateGestion = async () => {
    if (!selectedOficio) return;
    setIsUpdating(true);
    try {
      await api.put(`/sgs/${selectedOficio.id}`, selectedOficio);
      notifications.show({ title: 'Gestión actualizada', message: 'Los cambios han sido guardados.', color: 'teal' });
      setIsEditModalOpen(false);
      fetchOficios();
    } catch {
      notifications.show({ title: 'Error', message: 'No se pudo actualizar el registro.', color: 'red' });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const response = await api.get('/sgs/exportar-excel', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'sgs_matriz_seguimiento.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
      notifications.show({ title: 'Exportación exitosa', message: 'El archivo Excel se ha descargado.', color: 'teal' });
    } catch {
      notifications.show({ title: 'Error', message: 'No se pudo exportar la matriz.', color: 'red' });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="p-6 sm:p-10 max-w-[1600px] mx-auto h-full flex flex-col gap-6">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <Group gap="xs" mb={5}>
            <Badge color="teal" variant="light" radius="sm">Módulo SGS</Badge>
            <Text size="xs" c="dimmed" fw={600}>SMID | Matriz de seguimiento</Text>
          </Group>
          <Title order={1} className="font-extrabold tracking-tight">Control de oficios</Title>
          <Group gap="md" mt={6}>
            <Group gap={6}><Hash size={14} className="text-gray-400" /><Text size="xs" c="dimmed">{oficios.length} totales</Text></Group>
            <Group gap={6}><Activity size={14} className="text-blue-400" /><Text size="xs" c="dimmed">{oficios.filter(o => o.estado === 'EN CURSO').length} en curso</Text></Group>
            <Group gap={6}><Target size={14} className="text-violet-400" /><Text size="xs" c="dimmed">{totalEvaluados} evaluados</Text></Group>
          </Group>
        </div>
        <Group>
          <Button variant="default" leftSection={<FileSpreadsheet size={16} />} onClick={handleExport} loading={isExporting}>Exportar Excel</Button>
          <Button color="violet" leftSection={<ClipboardCheck size={16} />} onClick={() => setIsEvaluacionDrawerOpen(true)}>Evaluar respuesta (IA)</Button>
          <Button color="teal" leftSection={<Bot size={16} />} onClick={() => setIsAiDrawerOpen(true)}>Nuevo oficio (IA)</Button>
        </Group>
      </div>

      {/* TABLA */}
      <div className="bg-white rounded-xl border-t-4 border-t-[#1ABC9C] shadow-sm flex-1 flex flex-col overflow-hidden">
        <div className="p-4 border-b bg-gray-50/50 flex flex-col md:flex-row justify-between gap-4">
          <TextInput
            placeholder="Buscar por N° oficio o institución..."
            leftSection={<Search size={16} className="text-gray-400" />}
            className="w-full max-w-md"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.currentTarget.value)}
          />
          <Text size="sm" c="dimmed" fw={500} pt={10}>{filteredOficios.length} registros encontrados</Text>
        </div>

        <ScrollArea className="flex-1">
          <Table verticalSpacing="md" horizontalSpacing="lg" highlightOnHover>
            <Table.Thead className="bg-gray-50/80">
              <Table.Tr>
                <Table.Th>N° Oficio</Table.Th>
                <Table.Th>Fecha</Table.Th>
                <Table.Th>Institución</Table.Th>
                <Table.Th>Región</Table.Th>
                <Table.Th>Nudo crítico / Dimensión</Table.Th>
                <Table.Th>Estado</Table.Th>
                <Table.Th className="text-right">Acciones</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {isLoading ? (
                <Table.Tr><Table.Td colSpan={7} className="text-center py-10"><Text c="dimmed">Cargando matriz...</Text></Table.Td></Table.Tr>
              ) : filteredOficios.length > 0 ? (
                filteredOficios.map((oficio) => {
                  const gradient = getValoracionGradient(oficio.valoracionRubrica);
                  return (
                    <Table.Tr
                      key={oficio.id || oficio.nroOficio}
                      style={gradient ? { background: gradient } : undefined}
                    >
                      <Table.Td>
                        <Group gap={6}>
                          <Text size="sm" fw={700}>{oficio.nroOficio}</Text>
                          {oficio.valoracionRubrica && <ShieldCheck size={14} className="text-violet-500" />}
                        </Group>
                      </Table.Td>
                      <Table.Td><Text size="sm">{formatDate(oficio.fechaIngreso) || 'N/A'}</Text></Table.Td>
                      <Table.Td><Text size="sm" fw={600}>{oficio.institucion}</Text></Table.Td>
                      <Table.Td><Text size="sm">{oficio.region}</Text></Table.Td>
                      <Table.Td className="max-w-[280px]">
                        <Text size="sm" fw={700}>{oficio.dimension}</Text>
                        <Text size="xs" c="dimmed" className="truncate">{oficio.nudoCritico}</Text>
                      </Table.Td>
                      <Table.Td>
                        <Badge color={getEstadoColor(oficio.estado)} variant="light" size="sm" radius="sm">{oficio.estado}</Badge>
                      </Table.Td>
                      <Table.Td className="text-right">
                        <Menu position="bottom-end" withArrow>
                          <Menu.Target><ActionIcon variant="subtle" color="gray"><MoreVertical size={18} /></ActionIcon></Menu.Target>
                          <Menu.Dropdown>
                            <Menu.Item leftSection={<Eye size={14} />} onClick={() => { setSelectedOficio(oficio); setIsViewModalOpen(true); }}>Ver ficha completa</Menu.Item>
                            <Menu.Item leftSection={<Edit3 size={14} />} onClick={() => { setSelectedOficio(oficio); setIsEditModalOpen(true); }}>Gestionar seguimiento</Menu.Item>
                          </Menu.Dropdown>
                        </Menu>
                      </Table.Td>
                    </Table.Tr>
                  );
                })
              ) : (
                <Table.Tr><Table.Td colSpan={7} className="text-center py-10"><Text c="dimmed">No se encontraron registros</Text></Table.Td></Table.Tr>
              )}
            </Table.Tbody>
          </Table>
        </ScrollArea>
      </div>

      {/* MODAL: FICHA COMPLETA — REDISEÑADO CON 3 SECCIONES */}
      <Modal
        opened={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title={
          <Group gap="xs">
            <Info size={20} className="text-blue-500" />
            <Text fw={700}>Ficha completa del oficio</Text>
          </Group>
        }
        size="xl"
        scrollAreaComponent={ScrollArea.Autosize}
      >
        {selectedOficio && (
          <Stack gap="lg">

            {/* HEADER VISUAL */}
            <Paper p="md" radius="md" className="bg-gradient-to-r from-gray-50 to-white border">
              <Group justify="space-between" align="flex-start" wrap="nowrap">
                <div>
                  <Text size="xs" c="dimmed" tt="uppercase" fw={700} mb={4}>N° Oficio</Text>
                  <Title order={3} className="font-mono">{selectedOficio.nroOficio}</Title>
                  <Group gap={6} mt={4}>
                    <Calendar size={12} className="text-gray-400" />
                    <Text size="xs" c="dimmed">Ingresado: {formatDate(selectedOficio.fechaIngreso) || 'N/A'}</Text>
                  </Group>
                </div>
                <Stack gap={6} align="flex-end">
                  <Badge size="lg" color={getEstadoColor(selectedOficio.estado)} variant="filled">{selectedOficio.estado}</Badge>
                  {selectedOficio.valoracionRubrica && (
                    <Badge size="md" color={getValoracionColor(selectedOficio.valoracionRubrica)} variant="light" leftSection={<ShieldCheck size={12} />}>
                      {selectedOficio.valoracionRubrica}
                    </Badge>
                  )}
                </Stack>
              </Group>
            </Paper>

            {/* SECCIÓN 1: ORIGEN */}
            <Paper p="lg" radius="md" className="border-l-4 border-l-blue-500 bg-blue-50/30 border">
              <Group gap="xs" mb="md">
                <FolderOpen size={18} className="text-blue-600" />
                <Text fw={800} c="blue.7" tt="uppercase" size="sm" style={{ letterSpacing: 0.5 }}>Datos de origen (oficio inicial)</Text>
              </Group>
              <Grid>
                <Grid.Col span={4}><FieldRow label="Institución" value={selectedOficio.institucion} /></Grid.Col>
                <Grid.Col span={4}><FieldRow label="Nivel" value={selectedOficio.nivel} /></Grid.Col>
                <Grid.Col span={4}><FieldRow label="Tiempo / Plazo" value={selectedOficio.tiempo} /></Grid.Col>
                <Grid.Col span={4}>
                  <Group gap={6} mb={2}>
                    <MapPin size={12} className="text-gray-400" />
                    <Text size="xs" c="dimmed" tt="uppercase" fw={700} style={{ letterSpacing: 0.4 }}>Región</Text>
                  </Group>
                  <Text size="sm" fw={500}>{selectedOficio.region || <Text span c="dimmed" fs="italic">Sin información</Text>}</Text>
                </Grid.Col>
                <Grid.Col span={4}>
                  <Group gap={6} mb={2}>
                    <Building2 size={12} className="text-gray-400" />
                    <Text size="xs" c="dimmed" tt="uppercase" fw={700} style={{ letterSpacing: 0.4 }}>Residencia / Centro</Text>
                  </Group>
                  <Text size="sm" fw={500}>{selectedOficio.residenciaCentro || <Text span c="dimmed" fs="italic">Sin información</Text>}</Text>
                </Grid.Col>
                <Grid.Col span={4}><FieldRow label="Tipo de recomendación" value={selectedOficio.tipoRecomendacion} /></Grid.Col>
                <Grid.Col span={6}><FieldRow label="Dimensión" value={selectedOficio.dimension} /></Grid.Col>
                <Grid.Col span={12}>
                  <Text size="xs" c="dimmed" tt="uppercase" fw={700} mb={4} style={{ letterSpacing: 0.4 }}>Nudo crítico</Text>
                  <Alert color="blue" variant="light" p="sm">
                    <Text size="sm" fs="italic">{selectedOficio.nudoCritico || 'Sin información'}</Text>
                  </Alert>
                </Grid.Col>
                <Grid.Col span={12}>
                  <Text size="xs" c="dimmed" tt="uppercase" fw={700} mb={4} style={{ letterSpacing: 0.4 }}>Descripción</Text>
                  <Paper p="sm" className="bg-white border">
                    <Text size="sm" className="whitespace-pre-wrap">{selectedOficio.descripcion || 'Sin descripción'}</Text>
                  </Paper>
                </Grid.Col>
              </Grid>
            </Paper>

            {/* SECCIÓN 2: GESTIÓN HUMANA */}
            <Paper p="lg" radius="md" className="border-l-4 border-l-amber-500 bg-amber-50/30 border">
              <Group gap="xs" mb="md">
                <ClipboardCheck size={18} className="text-amber-600" />
                <Text fw={800} c="orange.7" tt="uppercase" size="sm" style={{ letterSpacing: 0.5 }}>Gestión humana y seguimiento</Text>
              </Group>
              <Grid>
                <Grid.Col span={6}><FieldRow label="Profesional responsable" value={selectedOficio.profesionalResponsable} /></Grid.Col>
                <Grid.Col span={6}><FieldRow label="Responsable seguimiento" value={selectedOficio.responsableSeguimiento} /></Grid.Col>
                <Grid.Col span={6}><FieldRow label="¿Acoge recomendación?" value={selectedOficio.acoge} /></Grid.Col>
                <Grid.Col span={6}><FieldRow label="Fase de seguimiento" value={selectedOficio.faseSeguimiento} /></Grid.Col>
                <Grid.Col span={12}>
                  <Text size="xs" c="dimmed" tt="uppercase" fw={700} mb={4} style={{ letterSpacing: 0.4 }}>Acción recomendada</Text>
                  <Paper p="sm" className="bg-white border">
                    <Text size="sm">{selectedOficio.accionRecomendada || <Text span c="dimmed" fs="italic">Sin acciones registradas</Text>}</Text>
                  </Paper>
                </Grid.Col>
                {selectedOficio.accionRecomendada2 && (
                  <Grid.Col span={12}>
                    <Text size="xs" c="dimmed" tt="uppercase" fw={700} mb={4} style={{ letterSpacing: 0.4 }}>Acción recomendada 2</Text>
                    <Paper p="sm" className="bg-white border">
                      <Text size="sm">{selectedOficio.accionRecomendada2}</Text>
                    </Paper>
                  </Grid.Col>
                )}
                <Grid.Col span={12}>
                  <Text size="xs" c="dimmed" tt="uppercase" fw={700} mb={4} style={{ letterSpacing: 0.4 }}>Otras acciones DDN</Text>
                  <Paper p="sm" className="bg-white border">
                    <Text size="sm">{selectedOficio.otrasAccionesDdn || <Text span c="dimmed" fs="italic">Sin observaciones</Text>}</Text>
                  </Paper>
                </Grid.Col>
              </Grid>
            </Paper>

            {/* SECCIÓN 3: EVALUACIÓN DE CUMPLIMIENTO */}
            <Paper p="lg" radius="md" className="border-l-4 border-l-violet-500 bg-violet-50/30 border">
              <Group gap="xs" mb="md" justify="space-between">
                <Group gap="xs">
                  <Gavel size={18} className="text-violet-600" />
                  <Text fw={800} c="violet.7" tt="uppercase" size="sm" style={{ letterSpacing: 0.5 }}>Evaluación de cumplimiento</Text>
                </Group>
                {!selectedOficio.valoracionRubrica && (
                  <Badge color="gray" variant="light" size="sm">Pendiente de evaluación</Badge>
                )}
              </Group>

              {selectedOficio.valoracionRubrica ? (
                <Grid>
                  <Grid.Col span={12}>
                    <Group justify="center" gap="md">
                      <Badge size="xl" color={getValoracionColor(selectedOficio.valoracionRubrica)} variant="filled" leftSection={<ShieldCheck size={14} />}>
                        {selectedOficio.valoracionRubrica}
                      </Badge>
                    </Group>
                  </Grid.Col>
                  {selectedOficio.evaluacionCumplimiento && (
                    <Grid.Col span={12}>
                      <Text size="xs" c="dimmed" tt="uppercase" fw={700} mb={4} style={{ letterSpacing: 0.4 }}>Resumen de evaluación</Text>
                      <Alert color="violet" variant="light" p="sm">
                        <Text size="sm">{selectedOficio.evaluacionCumplimiento}</Text>
                      </Alert>
                    </Grid.Col>
                  )}
                  <Grid.Col span={12}><Divider variant="dashed" my={4} /></Grid.Col>
                  <Grid.Col span={4}><FieldRow label="Tipo de respuesta" value={selectedOficio.tipoRespuesta} /></Grid.Col>
                  <Grid.Col span={4}><FieldRow label="Fecha de respuesta" value={formatDate(selectedOficio.fechaRespuesta)} /></Grid.Col>
                  <Grid.Col span={4}><FieldRow label="Fecha de seguimiento" value={formatDate(selectedOficio.fechaSeguimiento)} /></Grid.Col>
                  <Grid.Col span={4}><FieldRow label="Verbo" value={selectedOficio.verbo} /></Grid.Col>
                  <Grid.Col span={4}><FieldRow label="Materia" value={selectedOficio.materia} /></Grid.Col>
                  <Grid.Col span={4}><FieldRow label="Categoría" value={selectedOficio.categoria} /></Grid.Col>
                  <Grid.Col span={4}><FieldRow label="Tipo de seguimiento" value={selectedOficio.tipoSeguimiento} /></Grid.Col>
                  <Grid.Col span={4}><FieldRow label="Correlativo" value={selectedOficio.correlativo} mono /></Grid.Col>
                  <Grid.Col span={4}><FieldRow label="GV" value={selectedOficio.gv} /></Grid.Col>
                  <Grid.Col span={12}><FieldRow label="Otro seguimiento institucional" value={selectedOficio.otroSeguimientoInstitucional} /></Grid.Col>
                </Grid>
              ) : (
                <Alert color="gray" variant="light" icon={<Info size={16} />}>
                  Este oficio aún no tiene evaluación de cumplimiento aplicada. Usa el botón <strong>Evaluar respuesta (IA)</strong> en el dashboard para procesar el oficio de respuesta institucional.
                </Alert>
              )}
            </Paper>

          </Stack>
        )}
      </Modal>

      {/* MODAL: EDITAR/GESTIONAR (TABS) */}
      <Modal
        opened={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={<Group gap="xs"><Edit3 size={20} className="text-amber-500" /><Text fw={700}>Detalles y gestión del oficio</Text></Group>}
        size="xl"
      >
        {selectedOficio && (
          <Tabs defaultValue="gestion" color="yellow">
            <Tabs.List grow>
              <Tabs.Tab value="origen" leftSection={<FolderOpen size={14} />}>Datos de origen</Tabs.Tab>
              <Tabs.Tab value="gestion" leftSection={<ClipboardCheck size={14} />}>Gestión y seguimiento</Tabs.Tab>
              <Tabs.Tab value="evaluacion" leftSection={<Gavel size={14} />}>Evaluación y cumplimiento</Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel value="origen" pt="md">
              <Stack gap="md">
                <Alert color="blue" variant="light" icon={<Info size={14} />}>Estos datos provienen de la ingesta inicial y son de solo lectura.</Alert>
                <Grid>
                  <Grid.Col span={6}><TextInput label="N° Oficio" value={selectedOficio.nroOficio} readOnly variant="filled" /></Grid.Col>
                  <Grid.Col span={6}><TextInput label="Institución" value={selectedOficio.institucion} readOnly variant="filled" /></Grid.Col>
                  <Grid.Col span={4}><TextInput label="Región" value={selectedOficio.region} readOnly variant="filled" /></Grid.Col>
                  <Grid.Col span={4}><TextInput label="Dimensión" value={selectedOficio.dimension} readOnly variant="filled" /></Grid.Col>
                  <Grid.Col span={4}><TextInput label="Tiempo / Plazo" value={selectedOficio.tiempo || ''} readOnly variant="filled" /></Grid.Col>
                  <Grid.Col span={12}><Textarea label="Nudo crítico" rows={3} value={selectedOficio.nudoCritico || ''} readOnly variant="filled" /></Grid.Col>
                  <Grid.Col span={12}><Textarea label="Descripción" rows={4} value={selectedOficio.descripcion || ''} readOnly variant="filled" /></Grid.Col>
                </Grid>
              </Stack>
            </Tabs.Panel>

            <Tabs.Panel value="gestion" pt="md">
              <Stack gap="md">
                <Grid>
                  <Grid.Col span={4}>
                    <Select
                      label="Estado del oficio"
                      data={['PENDIENTE', 'EN CURSO', 'CERRADO']}
                      value={selectedOficio.estado}
                      onChange={(val) => setSelectedOficio({ ...selectedOficio, estado: val as any })}
                    />
                  </Grid.Col>
                  <Grid.Col span={4}><TextInput label="Profesional responsable" value={selectedOficio.profesionalResponsable || ''} onChange={(e) => setSelectedOficio({ ...selectedOficio, profesionalResponsable: e.target.value })} /></Grid.Col>
                  <Grid.Col span={4}><TextInput label="Responsable seguimiento" value={selectedOficio.responsableSeguimiento || ''} onChange={(e) => setSelectedOficio({ ...selectedOficio, responsableSeguimiento: e.target.value })} /></Grid.Col>
                  <Grid.Col span={6}>
                    <Select
                      label="¿Acoge recomendación?"
                      data={['SI', 'NO', 'PARCIALMENTE']}
                      value={selectedOficio.acoge || null}
                      onChange={(val) => setSelectedOficio({ ...selectedOficio, acoge: val || undefined })}
                      clearable
                    />
                  </Grid.Col>
                  <Grid.Col span={6}><TextInput label="Fase de seguimiento" value={selectedOficio.faseSeguimiento || ''} onChange={(e) => setSelectedOficio({ ...selectedOficio, faseSeguimiento: e.target.value })} /></Grid.Col>
                  <Grid.Col span={12}><Textarea label="Acción recomendada" rows={3} value={selectedOficio.accionRecomendada || ''} onChange={(e) => setSelectedOficio({ ...selectedOficio, accionRecomendada: e.target.value })} /></Grid.Col>
                  <Grid.Col span={12}><Textarea label="Acción recomendada 2" rows={2} value={selectedOficio.accionRecomendada2 || ''} onChange={(e) => setSelectedOficio({ ...selectedOficio, accionRecomendada2: e.target.value })} /></Grid.Col>
                  <Grid.Col span={12}><Textarea label="Otras acciones DDN" rows={2} value={selectedOficio.otrasAccionesDdn || ''} onChange={(e) => setSelectedOficio({ ...selectedOficio, otrasAccionesDdn: e.target.value })} /></Grid.Col>
                </Grid>
              </Stack>
            </Tabs.Panel>

            <Tabs.Panel value="evaluacion" pt="md">
              <Stack gap="md">
                <Alert color="violet" variant="light" icon={<Sparkles size={14} />}>
                  Estos campos pueden ser llenados automáticamente por la IA usando el flujo <strong>Evaluar respuesta</strong>, o editados manualmente aquí.
                </Alert>
                <Grid>
                  <Grid.Col span={6}>
                    <Select
                      label="Valoración rúbrica"
                      data={VALORACION_OPTIONS}
                      value={selectedOficio.valoracionRubrica || null}
                      onChange={(val) => setSelectedOficio({ ...selectedOficio, valoracionRubrica: val || undefined })}
                      clearable
                    />
                  </Grid.Col>
                  <Grid.Col span={6}><TextInput label="Tipo de respuesta" value={selectedOficio.tipoRespuesta || ''} onChange={(e) => setSelectedOficio({ ...selectedOficio, tipoRespuesta: e.target.value })} /></Grid.Col>
                  <Grid.Col span={12}><Textarea label="Evaluación de cumplimiento (resumen)" rows={2} value={selectedOficio.evaluacionCumplimiento || ''} onChange={(e) => setSelectedOficio({ ...selectedOficio, evaluacionCumplimiento: e.target.value })} /></Grid.Col>
                  <Grid.Col span={4}><TextInput label="Verbo" value={selectedOficio.verbo || ''} onChange={(e) => setSelectedOficio({ ...selectedOficio, verbo: e.target.value })} /></Grid.Col>
                  <Grid.Col span={4}><TextInput label="Materia" value={selectedOficio.materia || ''} onChange={(e) => setSelectedOficio({ ...selectedOficio, materia: e.target.value })} /></Grid.Col>
                  <Grid.Col span={4}><TextInput label="Categoría" value={selectedOficio.categoria || ''} onChange={(e) => setSelectedOficio({ ...selectedOficio, categoria: e.target.value })} /></Grid.Col>
                  <Grid.Col span={4}><TextInput label="Tipo de seguimiento" value={selectedOficio.tipoSeguimiento || ''} onChange={(e) => setSelectedOficio({ ...selectedOficio, tipoSeguimiento: e.target.value })} /></Grid.Col>
                  <Grid.Col span={4}><TextInput type="date" label="Fecha de seguimiento" value={selectedOficio.fechaSeguimiento || ''} onChange={(e) => setSelectedOficio({ ...selectedOficio, fechaSeguimiento: e.target.value })} /></Grid.Col>
                  <Grid.Col span={4}><TextInput type="date" label="Fecha de respuesta" value={selectedOficio.fechaRespuesta || ''} onChange={(e) => setSelectedOficio({ ...selectedOficio, fechaRespuesta: e.target.value })} /></Grid.Col>
                  <Grid.Col span={4}><TextInput label="Correlativo" value={selectedOficio.correlativo || ''} onChange={(e) => setSelectedOficio({ ...selectedOficio, correlativo: e.target.value })} /></Grid.Col>
                  <Grid.Col span={4}><TextInput label="GV" value={selectedOficio.gv || ''} onChange={(e) => setSelectedOficio({ ...selectedOficio, gv: e.target.value })} /></Grid.Col>
                  <Grid.Col span={4}><TextInput label="Otro seguimiento institucional" value={selectedOficio.otroSeguimientoInstitucional || ''} onChange={(e) => setSelectedOficio({ ...selectedOficio, otroSeguimientoInstitucional: e.target.value })} /></Grid.Col>
                </Grid>
              </Stack>
            </Tabs.Panel>

            <Group justify="flex-end" mt="xl" pt="md" className="border-t">
              <Button variant="default" onClick={() => setIsEditModalOpen(false)}>Cancelar</Button>
              <Button color="yellow" c="dark" onClick={handleUpdateGestion} loading={isUpdating} leftSection={<Check size={16} />}>Guardar todos los cambios</Button>
            </Group>
          </Tabs>
        )}
      </Modal>

      {/* DRAWERS */}
      <Drawer
        opened={isAiDrawerOpen}
        onClose={() => setIsAiDrawerOpen(false)}
        position="right"
        size="lg"
        title={<Group gap="sm"><Bot className="text-teal-600" size={24} /><Title order={4}>Ingesta inteligente</Title></Group>}
      >
        <IngestaDrawerContent onClose={() => setIsAiDrawerOpen(false)} onIngestaExitosa={fetchOficios} />
      </Drawer>

      <Drawer
        opened={isEvaluacionDrawerOpen}
        onClose={() => setIsEvaluacionDrawerOpen(false)}
        position="right"
        size="xl"
        title={<Group gap="sm"><ClipboardCheck className="text-violet-600" size={24} /><Title order={4}>Evaluación de cumplimiento</Title></Group>}
      >
        <EvaluacionDrawerContent
          oficios={oficios}
          onClose={() => setIsEvaluacionDrawerOpen(false)}
          onEvaluacionExitosa={fetchOficios}
        />
      </Drawer>

    </div>
  );
};