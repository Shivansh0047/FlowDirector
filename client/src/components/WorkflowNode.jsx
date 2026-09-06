import { memo } from 'react'
import { Handle, Position } from 'reactflow'
import { Sparkles, Image, Video, Mic, CheckCircle, Clock, AlertCircle, Zap, Shield } from 'lucide-react'

// Node type to icon mapping
const NODE_ICONS = {
  brief: Sparkles,
  agent: Sparkles,
  image_generation: Image,
  video_generation: Video,
  audio_generation: Mic,
  export: CheckCircle,
  brand_check: Shield,
}

// Status color mapping
const STATUS_COLORS = {
  draft: 'border-slate-600 bg-slate-800/50',
  ready: 'border-primary bg-primary/10',
  running: 'border-cyan-500 bg-cyan-500/10',
  completed: 'border-emerald-500 bg-emerald-500/10',
  failed: 'border-red-500 bg-red-500/10',
}

function WorkflowNode({ data, selected }) {
  const Icon = NODE_ICONS[data.type] || Sparkles
  const statusColor = STATUS_COLORS[data.status] || STATUS_COLORS.draft

  return (
    <div
      className={`
        min-w-[200px] rounded-lg border-2 p-3 shadow-lg backdrop-blur
        transition-all
        ${statusColor}
        ${selected ? 'ring-2 ring-primary ring-offset-2 ring-offset-slate-950' : ''}
      `}
    >
      {/* Input handle */}
      {data.type !== 'brief' && (
        <Handle
          type="target"
          position={Position.Top}
          className="!bg-primary !w-3 !h-3 !border-2 !border-slate-900"
        />
      )}

      {/* Node header */}
      <div className="flex items-start gap-2 mb-2">
        <Icon className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-sm text-slate-100 truncate">
            {data.label}
          </div>
          <div className="text-xs text-slate-500 truncate">
            {data.type.replace('_', ' ')}
          </div>
        </div>
      </div>

      {/* Model info */}
      {data.model && (
        <div className="text-xs text-slate-400 mb-2 flex items-center gap-1.5">
          <span className="text-slate-500">Model:</span>
          <span className="font-mono text-primary truncate">{data.model.name}</span>
        </div>
      )}

      {/* Cost and time */}
      {(data.estimatedCost || data.estimatedTime) && (
        <div className="flex items-center gap-3 text-xs text-slate-400">
          {data.estimatedCost && (
            <span className="flex items-center gap-1">
              <span className="text-emerald-400">${data.estimatedCost.toFixed(2)}</span>
            </span>
          )}
          {data.estimatedTime && (
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {data.estimatedTime}s
            </span>
          )}
        </div>
      )}

      {/* Brand check indicator */}
      {data.brandCheck && (
        <div className="text-xs text-cyan-400 mb-2 flex items-center gap-1.5">
          <Zap className="w-3 h-3" />
          Brand: {data.brandCheck.score}% match
        </div>
      )}

      {/* Mock generated output (mock web photos only) */}
      {(data.type === 'image_generation' || data.type === 'video_generation' || data.type === 'audio_generation') && (
        <div className='mt-2 mb-2 rounded-lg overflow-hidden border border-slate-600 shadow-inner'>
          <img
            src={data.type === 'audio_generation'
              ? 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=400&q=80'
              : (data.type === 'video_generation' ? 'https://images.unsplash.com/photo-1493246507139-91e8fad9978e?w=400&q=80' : 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&q=80')}
            alt='Mock generated output'
            className='w-full h-24 object-cover hover:scale-105 transition-transform duration-500'
          />
          <div className='text-[10px] text-slate-400 bg-slate-900/80 px-2 py-0.5'>Mock output — unsplash source</div>
        </div>
      )}

      {/* Status badge */}
      <div className="mt-2 pt-2 border-t border-slate-700/50">
        <StatusBadge status={data.status} />
      </div>

      {/* Output handle */}
      {data.type !== 'export' && (
        <Handle
          type="source"
          position={Position.Bottom}
          className="!bg-primary !w-3 !h-3 !border-2 !border-slate-900"
        />
      )}
    </div>
  )
}

function StatusBadge({ status }) {
  const config = {
    draft: { label: 'Draft', color: 'text-slate-400' },
    ready: { label: 'Ready', color: 'text-primary' },
    running: { label: 'Running', color: 'text-cyan-400' },
    completed: { label: 'Completed', color: 'text-emerald-400' },
    failed: { label: 'Failed', color: 'text-red-400' },
  }

  const { label, color } = config[status] || config.draft

  return (
    <div className={`text-xs font-medium ${color} flex items-center gap-1`}>
      {status === 'running' && <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />}
      {status === 'failed' && <AlertCircle className="w-3 h-3" />}
      {label}
    </div>
  )
}

export default memo(WorkflowNode)
