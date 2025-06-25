import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineOppositeContent,
} from "@mui/lab"
import { Typography, Paper } from "@mui/material"
import { Create, Update, Security, Info, CheckCircle } from "@mui/icons-material"

const AuditTimeline = ({ auditLog }) => {
  const getActionIcon = (action) => {
    switch (action) {
      case "dpp_created":
        return <Create />
      case "status_updated":
        return <Update />
      case "permission_changed":
        return <Security />
      case "verified":
        return <CheckCircle />
      default:
        return <Info />
    }
  }

  const getActionColor = (action) => {
    switch (action) {
      case "dpp_created":
        return "primary"
      case "status_updated":
        return "secondary"
      case "permission_changed":
        return "warning"
      case "verified":
        return "success"
      default:
        return "grey"
    }
  }

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleString("pt-BR")
  }

  if (!auditLog || auditLog.length === 0) {
    return (
      <Typography color="text.secondary" align="center">
        Nenhum registro de auditoria disponível
      </Typography>
    )
  }

  return (
    <Timeline position="right">
      {auditLog.map((entry, index) => (
        <TimelineItem key={index}>
          <TimelineOppositeContent color="text.secondary" sx={{ flex: 0.3 }}>
            <Typography variant="body2">{formatDate(entry.timestamp)}</Typography>
            <Typography variant="caption">por {entry.actor}</Typography>
          </TimelineOppositeContent>

          <TimelineSeparator>
            <TimelineDot color={getActionColor(entry.action)}>{getActionIcon(entry.action)}</TimelineDot>
            {index < auditLog.length - 1 && <TimelineConnector />}
          </TimelineSeparator>

          <TimelineContent sx={{ flex: 0.7 }}>
            <Paper elevation={1} sx={{ p: 2, borderRadius: 2 }}>
              <Typography variant="subtitle2" color="primary">
                {entry.action.replace("_", " ").toUpperCase()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {entry.details}
              </Typography>
            </Paper>
          </TimelineContent>
        </TimelineItem>
      ))}
    </Timeline>
  )
}

export default AuditTimeline
