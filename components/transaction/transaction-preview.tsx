"use client"

import React, { useState } from "react"
import { CardContainer } from "@/components/ui/card-container"
import { StatusBadge } from "@/components/ui/status-badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  TransactionPreview as TransactionPreviewType,
  TokenAmountChange,
  SolAmountChange
} from "@/services/transaction-preview"
import { 
  TransactionApprovalResult,
  TransactionApprovalStatus,
  TransactionRiskLevel
} from "@/services/transaction-approval"
import { 
  Anomaly,
  AnomalyType,
  AnomalySeverity
} from "@/services/transaction-anomaly-detection"
import { useSecurity } from "@/hooks/useSecurity"
import { 
  AlertTriangle, 
  Check, 
  X, 
  ChevronDown, 
  ChevronUp,
  Shield,
  ShieldAlert,
  ShieldCheck,
  ShieldX,
  DollarSign,
  FileText,
  AlertCircle,
  Info
} from "lucide-react"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface TransactionPreviewProps {
  preview: TransactionPreviewType;
  approval?: TransactionApprovalResult;
  anomalies?: Anomaly[];
  onApprove?: () => void;
  onReject?: () => void;
  showApprovalButtons?: boolean;
  isLoading?: boolean;
}

export function TransactionPreview({
  preview,
  approval,
  anomalies = [],
  onApprove,
  onReject,
  showApprovalButtons = true,
  isLoading = false,
}: TransactionPreviewProps) {
  const { 
    getRiskLevelDescription,
    getRiskLevelColor,
    getAnomalySeverityDescription,
    getAnomalySeverityColor,
    getAnomalyTypeDescription,
    TransactionApprovalStatus,
    TransactionRiskLevel,
  } = useSecurity()
  
  const [showDetails, setShowDetails] = useState(false)
  
  // Get approval status
  const getApprovalStatus = () => {
    if (!approval) {
      return {
        status: TransactionApprovalStatus.PENDING,
        riskLevel: TransactionRiskLevel.MEDIUM,
      }
    }
    
    return {
      status: approval.status,
      riskLevel: approval.riskLevel,
    }
  }
  
  // Get status badge variant
  const getStatusBadgeVariant = () => {
    const { status, riskLevel } = getApprovalStatus()
    
    switch (status) {
      case TransactionApprovalStatus.APPROVED:
        return "success"
      case TransactionApprovalStatus.REJECTED:
        return "error"
      case TransactionApprovalStatus.REQUIRES_CONFIRMATION:
        return riskLevel === TransactionRiskLevel.HIGH ? "warning" : "info"
      case TransactionApprovalStatus.PENDING:
      default:
        return "neutral"
    }
  }
  
  // Get status badge text
  const getStatusBadgeText = () => {
    const { status, riskLevel } = getApprovalStatus()
    
    switch (status) {
      case TransactionApprovalStatus.APPROVED:
        return "Approved"
      case TransactionApprovalStatus.REJECTED:
        return "Rejected"
      case TransactionApprovalStatus.REQUIRES_CONFIRMATION:
        return "Requires Confirmation"
      case TransactionApprovalStatus.PENDING:
      default:
        return "Pending"
    }
  }
  
  // Get status icon
  const getStatusIcon = () => {
    const { status, riskLevel } = getApprovalStatus()
    
    switch (status) {
      case TransactionApprovalStatus.APPROVED:
        return <ShieldCheck className="h-6 w-6 text-green-500" />
      case TransactionApprovalStatus.REJECTED:
        return <ShieldX className="h-6 w-6 text-red-500" />
      case TransactionApprovalStatus.REQUIRES_CONFIRMATION:
        return riskLevel === TransactionRiskLevel.HIGH 
          ? <ShieldAlert className="h-6 w-6 text-orange-500" />
          : <Shield className="h-6 w-6 text-blue-500" />
      case TransactionApprovalStatus.PENDING:
      default:
        return <Shield className="h-6 w-6 text-gray-500" />
    }
  }
  
  // Get risk level badge
  const getRiskLevelBadge = () => {
    const { riskLevel } = getApprovalStatus()
    
    let variant: "default" | "success" | "warning" | "error" | "info" | "pending" | "neutral" = "neutral"
    
    switch (riskLevel) {
      case TransactionRiskLevel.LOW:
        variant = "success"
        break
      case TransactionRiskLevel.MEDIUM:
        variant = "warning"
        break
      case TransactionRiskLevel.HIGH:
        variant = "error"
        break
      case TransactionRiskLevel.CRITICAL:
        variant = "error"
        break
    }
    
    return (
      <StatusBadge variant={variant} size="md">
        {riskLevel.charAt(0).toUpperCase() + riskLevel.slice(1)} Risk
      </StatusBadge>
    )
  }
  
  // Render token changes
  const renderTokenChanges = () => {
    if (preview.tokenChanges.length === 0) {
      return (
        <div className="text-center text-muted-foreground">
          No token changes detected
        </div>
      )
    }
    
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Token</TableHead>
            <TableHead>Change</TableHead>
            <TableHead className="text-right">Value</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {preview.tokenChanges.map((change, index) => (
            <TableRow key={index}>
              <TableCell>
                {change.mintSymbol || change.mintName || change.mint.slice(0, 8) + '...'}
              </TableCell>
              <TableCell className={change.rawChange >= 0 ? 'text-green-500' : 'text-red-500'}>
                {change.formattedChange}
              </TableCell>
              <TableCell className="text-right">
                {change.usdValue 
                  ? `$${Math.abs(change.usdValue).toFixed(2)}`
                  : '-'
                }
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    )
  }
  
  // Render SOL changes
  const renderSolChanges = () => {
    if (preview.solChanges.length === 0) {
      return (
        <div className="text-center text-muted-foreground">
          No SOL changes detected
        </div>
      )
    }
    
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Type</TableHead>
            <TableHead>Change</TableHead>
            <TableHead className="text-right">Value</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {preview.solChanges.map((change, index) => (
            <TableRow key={index}>
              <TableCell>
                {change.fee > 0 ? 'Transaction Fee' : 'Transfer'}
              </TableCell>
              <TableCell className={change.rawChange >= 0 ? 'text-green-500' : 'text-red-500'}>
                {change.formattedChange}
              </TableCell>
              <TableCell className="text-right">
                {change.usdValue 
                  ? `$${Math.abs(change.usdValue).toFixed(2)}`
                  : '-'
                }
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    )
  }
  
  // Render risk factors
  const renderRiskFactors = () => {
    if (!approval || approval.riskFactors.length === 0) {
      return (
        <div className="text-center text-muted-foreground">
          No risk factors detected
        </div>
      )
    }
    
    return (
      <ul className="space-y-2">
        {approval.riskFactors.map((factor, index) => (
          <li key={index} className="flex items-start gap-2">
            <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-yellow-500" />
            <span>{factor}</span>
          </li>
        ))}
      </ul>
    )
  }
  
  // Render anomalies
  const renderAnomalies = () => {
    if (anomalies.length === 0) {
      return (
        <div className="text-center text-muted-foreground">
          No anomalies detected
        </div>
      )
    }
    
    return (
      <ul className="space-y-3">
        {anomalies.map((anomaly, index) => (
          <li key={index} className="rounded-md border p-3">
            <div className="mb-1 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {anomaly.severity === AnomalySeverity.CRITICAL ? (
                  <AlertCircle className="h-4 w-4 text-red-500" />
                ) : anomaly.severity === AnomalySeverity.WARNING ? (
                  <AlertTriangle className="h-4 w-4 text-yellow-500" />
                ) : (
                  <Info className="h-4 w-4 text-blue-500" />
                )}
                <span className="font-medium">
                  {getAnomalyTypeDescription(anomaly.type)}
                </span>
              </div>
              <StatusBadge
                variant={
                  anomaly.severity === AnomalySeverity.CRITICAL
                    ? "error"
                    : anomaly.severity === AnomalySeverity.WARNING
                    ? "warning"
                    : "info"
                }
                size="sm"
              >
                {getAnomalySeverityDescription(anomaly.severity)}
              </StatusBadge>
            </div>
            <p className="text-sm text-muted-foreground">{anomaly.description}</p>
          </li>
        ))}
      </ul>
    )
  }
  
  // Render accounts
  const renderAccounts = () => {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <div className="rounded-md border p-3 text-center">
            <div className="text-2xl font-bold">{preview.accounts.writableCount}</div>
            <div className="text-xs text-muted-foreground">Writable Accounts</div>
          </div>
          <div className="rounded-md border p-3 text-center">
            <div className="text-2xl font-bold">{preview.accounts.signerCount}</div>
            <div className="text-xs text-muted-foreground">Signers</div>
          </div>
          <div className="rounded-md border p-3 text-center">
            <div className="text-2xl font-bold">{preview.accounts.readonlyCount}</div>
            <div className="text-xs text-muted-foreground">Readonly Accounts</div>
          </div>
        </div>
        
        {preview.accounts.newAccounts.length > 0 && (
          <div>
            <h4 className="mb-2 text-sm font-medium">New Accounts</h4>
            <ul className="space-y-1 text-xs">
              {preview.accounts.newAccounts.map((account, index) => (
                <li key={index} className="font-mono">
                  {account}
                </li>
              ))}
            </ul>
          </div>
        )}
        
        <div>
          <h4 className="mb-2 text-sm font-medium">Programs</h4>
          <ul className="space-y-1 text-xs">
            {preview.accounts.programIds.map((programId, index) => (
              <li key={index} className="font-mono">
                {programId}
              </li>
            ))}
          </ul>
        </div>
      </div>
    )
  }
  
  // Render logs
  const renderLogs = () => {
    if (preview.logs.length === 0) {
      return (
        <div className="text-center text-muted-foreground">
          No logs available
        </div>
      )
    }
    
    return (
      <div className="max-h-60 overflow-y-auto rounded-md bg-muted p-3 font-mono text-xs">
        {preview.logs.map((log, index) => (
          <div key={index}>{log}</div>
        ))}
      </div>
    )
  }
  
  return (
    <CardContainer
      title="Transaction Preview"
      description="Review transaction details before approving"
      isLoading={isLoading}
      headerAction={
        <div className="flex items-center gap-2">
          <StatusBadge variant={getStatusBadgeVariant()} size="sm">
            {getStatusBadgeText()}
          </StatusBadge>
          {getRiskLevelBadge()}
        </div>
      }
    >
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {getStatusIcon()}
          <div>
            <h3 className="text-lg font-medium">
              {approval ? getRiskLevelDescription(approval.riskLevel) : "Transaction Preview"}
            </h3>
            <p className="text-sm text-muted-foreground">
              Estimated fee: {preview.formattedEstimatedFee}
            </p>
          </div>
        </div>
        
        {showApprovalButtons && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={onReject}
              disabled={isLoading}
            >
              <X className="mr-2 h-4 w-4" />
              Reject
            </Button>
            <Button
              variant="default"
              onClick={onApprove}
              disabled={
                isLoading || 
                (approval && approval.status === TransactionApprovalStatus.REJECTED)
              }
            >
              <Check className="mr-2 h-4 w-4" />
              Approve
            </Button>
          </div>
        )}
      </div>
      
      <Tabs defaultValue="changes">
        <TabsList className="mb-4">
          <TabsTrigger value="changes">
            <DollarSign className="mr-2 h-4 w-4" />
            Changes
          </TabsTrigger>
          <TabsTrigger value="risks">
            <ShieldAlert className="mr-2 h-4 w-4" />
            Risks
          </TabsTrigger>
          <TabsTrigger value="details">
            <FileText className="mr-2 h-4 w-4" />
            Details
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="changes">
          <div className="space-y-6">
            <div>
              <h3 className="mb-3 text-lg font-medium">Token Changes</h3>
              {renderTokenChanges()}
            </div>
            
            <div>
              <h3 className="mb-3 text-lg font-medium">SOL Changes</h3>
              {renderSolChanges()}
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="risks">
          <div className="space-y-6">
            <div>
              <h3 className="mb-3 text-lg font-medium">Risk Factors</h3>
              {renderRiskFactors()}
            </div>
            
            <div>
              <h3 className="mb-3 text-lg font-medium">Anomalies</h3>
              {renderAnomalies()}
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="details">
          <div className="space-y-6">
            <div>
              <h3 className="mb-3 text-lg font-medium">Accounts</h3>
              {renderAccounts()}
            </div>
            
            <div>
              <h3 className="mb-3 text-lg font-medium">Transaction Logs</h3>
              {renderLogs()}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </CardContainer>
  )
}
