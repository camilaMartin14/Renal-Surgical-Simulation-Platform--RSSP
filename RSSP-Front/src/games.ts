import type { GameInfo } from './types'

export const GAMES: GameInfo[] = [
  { 
    id: 'line-precision', 
    title: 'Sutura de Vena Renal', 
    description: 'Práctica de sutura de precisión en vena renal. Sigue el camino con exactitud.', 
    path: '/line-precision',
    requiredRank: 'Estudiante'
  },
  { 
    id: 'reflex', 
    title: 'Control de Hemorragia Renal', 
    description: 'Controla los puntos de sangrado durante la nefrectomía parcial. Prueba tu tiempo de reacción.', 
    path: '/reflex',
    requiredRank: 'Estudiante'
  },
  { 
    id: 'suture', 
    title: 'Sutura de Trasplante Renal', 
    description: 'Ejecuta patrones de sutura correctos para la anastomosis de la arteria renal.', 
    path: '/suture',
    requiredRank: 'Residente'
  },
  { 
    id: 'steady-hand', 
    title: 'Disección de Arteria Renal', 
    description: 'Mantén la estabilidad del instrumento durante la delicada disección de la arteria renal.', 
    path: '/steady-hand',
    requiredRank: 'Residente'
  },
  { 
    id: 'tumor-ablation', 
    title: 'Ablación de Tumor Renal', 
    description: 'Elimina el carcinoma de células renales preservando el tejido renal sano.', 
    path: '/tumor-ablation',
    requiredRank: 'Cirujano Jefe'
  },
]
