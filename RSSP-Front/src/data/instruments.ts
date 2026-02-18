import { Instrument } from '../types'

export const INSTRUMENTS: Instrument[] = [
  { id: 'scalpel-10', name: 'Bisturí #10', type: 'scalpel', description: 'Para incisiones grandes en piel.' },
  { id: 'scalpel-11', name: 'Bisturí #11', type: 'scalpel', description: 'Hoja puntiaguda para incisiones de precisión.' },
  { id: 'forceps-debakey', name: 'Pinzas DeBakey', type: 'forceps', description: 'Atraumáticas para tejido vascular.' },
  { id: 'forceps-adson', name: 'Pinzas Adson', type: 'forceps', description: 'Con dientes, para piel y fascia.' },
  { id: 'suture-prolene', name: 'Sutura Prolene 4-0', type: 'suture', description: 'Monofilamento no absorbible, vascular.' },
  { id: 'suture-vicryl', name: 'Sutura Vicryl 3-0', type: 'suture', description: 'Trenzada absorbible, tejido subcutáneo.' },
  { id: 'suction-yankauer', name: 'Aspirador Yankauer', type: 'suction', description: 'Para grandes volúmenes de fluido.' },
  { id: 'suction-frazier', name: 'Aspirador Frazier', type: 'suction', description: 'Punta fina para neuro/vascular.' },
  { id: 'clamp-satinsky', name: 'Clamp Satinsky', type: 'clamp', description: 'Oclusión parcial de vena cava/porta.' },
  { id: 'clamp-bulldog', name: 'Clamp Bulldog', type: 'clamp', description: 'Oclusión vascular temporal pequeña.' },
  { id: 'lap-camera', name: 'Cámara 30°', type: 'camera', description: 'Laparoscopio con ángulo de visión.' },
  { id: 'ultrasound-probe', name: 'Sonda Intraop', type: 'ultrasound', description: 'Transductor para eco intraoperatoria.' },
]
