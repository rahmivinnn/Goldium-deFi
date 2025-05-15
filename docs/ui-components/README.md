# Goldium DeFi Platform UI Components

## Overview

The Goldium DeFi platform includes a comprehensive set of UI components designed to provide a consistent, accessible, and user-friendly interface. These components are built with React and integrate seamlessly with the platform's hooks and services.

## Available UI Components

### Transaction Components

- [**Transaction History Panel**](./transaction-history-panel.md): Displays a history of user transactions with filtering and sorting options.
- [**Transaction Preview**](./transaction-preview.md): Shows a detailed preview of a transaction before it is signed and sent.
- [**Transaction Status Badge**](./transaction-status-badge.md): Indicates the current status of a transaction.

### Network Components

- [**Network Status Dashboard**](./network-status-dashboard.md): Displays the current status of the network and RPC endpoints.
- [**Network Selector**](./network-selector.md): Allows users to switch between different networks (Mainnet, Testnet, Devnet).
- [**Endpoint Manager**](./endpoint-manager.md): Enables users to add, remove, and select custom RPC endpoints.

### Error Components

- [**Error Log Viewer**](./error-log-viewer.md): Displays a log of errors with filtering and resolution options.
- [**Error Message**](./error-message.md): Shows user-friendly error messages with potential solutions.
- [**Error Boundary**](./error-boundary.md): Catches and handles errors in React components.

### Analytics Components

- [**Analytics Dashboard**](./analytics-dashboard.md): Displays analytics data with charts and metrics.
- [**Performance Monitor**](./performance-monitor.md): Shows performance metrics for the application.
- [**Funnel Visualization**](./funnel-visualization.md): Visualizes conversion funnels with drop-off points.

### Common UI Components

- [**Card Container**](./card-container.md): A container for content with consistent styling.
- [**Status Badge**](./status-badge.md): Indicates status with color-coded badges.
- [**Button**](./button.md): Customizable button component with various styles and states.
- [**Tabs**](./tabs.md): Tabbed interface for organizing content.
- [**Table**](./table.md): Data table with sorting, filtering, and pagination.
- [**Accordion**](./accordion.md): Collapsible content panels for presenting information in a limited space.

## Component Architecture

The UI components are organized in a hierarchical structure:

```
┌─────────────────────────────────────────────────────────────────┐
│                        Page Components                          │
│                                                                 │
│  ┌─────────────┐       ┌─────────────┐       ┌─────────────┐    │
│  │  Dashboard  │       │    Swap     │       │   Stake     │    │
│  │    Page     │       │    Page     │       │    Page     │    │
│  └──────┬──────┘       └──────┬──────┘       └──────┬──────┘    │
└─────────┼────────────────────┼────────────────────┼─────────────┘
          │                     │                    │
┌─────────▼─────────────────────▼────────────────────▼─────────────┐
│                     Feature Components                           │
│                                                                 │
│  ┌─────────────┐       ┌─────────────┐       ┌─────────────┐    │
│  │ Transaction │       │   Network   │       │    Error    │    │
│  │   History   │       │   Status    │       │    Log      │    │
│  └──────┬──────┘       └──────┬──────┘       └──────┬──────┘    │
└─────────┼────────────────────┼────────────────────┼─────────────┘
          │                     │                    │
┌─────────▼─────────────────────▼────────────────────▼─────────────┐
│                      Common Components                           │
│                                                                 │
│  ┌─────────────┐       ┌─────────────┐       ┌─────────────┐    │
│  │    Card     │       │   Status    │       │   Button    │    │
│  │  Container  │       │    Badge    │       │             │    │
│  └─────────────┘       └─────────────┘       └─────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

## Component Integration

The UI components integrate with the platform's hooks and services to provide a seamless user experience:

```
┌─────────────────────────────────────────────────────────────────┐
│                        UI Components                            │
└───────────────────────────┬─────────────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────────┐
│                         Hook Layer                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────┐ │
│  │useTransaction│  │  useCache   │  │ useSecurity │  │useError │ │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────┘ │
└───────────────────────────┬─────────────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────────┐
│                       Service Layer                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────┐ │
│  │ Transaction │  │    Cache    │  │  Security   │  │  Error  │ │
│  │  Services   │  │   Services  │  │  Services   │  │ Services│ │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## Usage Examples

### Transaction History Panel

```tsx
import { TransactionHistoryPanel } from "@/components/transaction/transaction-history-panel";

function Dashboard() {
  return (
    <div className="dashboard">
      <h1>Dashboard</h1>
      
      <div className="dashboard-content">
        <div className="dashboard-sidebar">
          <TransactionHistoryPanel
            maxItems={10}
            showFilters={true}
            onTransactionClick={(tx) => console.log("Transaction clicked:", tx)}
          />
        </div>
        
        <div className="dashboard-main">
          {/* Other dashboard content */}
        </div>
      </div>
    </div>
  );
}
```

### Transaction Preview

```tsx
import { TransactionPreview } from "@/components/transaction/transaction-preview";
import { useSecurity } from "@/hooks/useSecurity";
import { useState } from "react";

function SwapComponent() {
  const { previewTransaction, approveTransaction } = useSecurity();
  const [preview, setPreview] = useState(null);
  const [approval, setApproval] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const handlePreviewTransaction = async () => {
    setIsLoading(true);
    
    // Create transaction
    const transaction = createTransaction();
    
    // Generate preview
    const txPreview = await previewTransaction(transaction);
    setPreview(txPreview);
    
    // Approve transaction
    const txApproval = await approveTransaction(transaction);
    setApproval(txApproval);
    
    setIsLoading(false);
  };
  
  const handleApprove = () => {
    // Send transaction
    console.log("Transaction approved");
  };
  
  const handleReject = () => {
    // Cancel transaction
    console.log("Transaction rejected");
  };
  
  return (
    <div>
      <button onClick={handlePreviewTransaction}>Preview Swap</button>
      
      {preview && approval && (
        <TransactionPreview
          preview={preview}
          approval={approval}
          onApprove={handleApprove}
          onReject={handleReject}
          showApprovalButtons={true}
          isLoading={isLoading}
        />
      )}
    </div>
  );
}
```

### Network Status Dashboard

```tsx
import { NetworkStatusDashboard } from "@/components/network/network-status-dashboard";
import { useNetworkMonitoring } from "@/hooks/useNetworkMonitoring";

function NetworkMonitor() {
  const { 
    switchToBestEndpoint, 
    isAutoSwitchEnabled, 
    toggleAutoSwitch 
  } = useNetworkMonitoring();
  
  return (
    <div>
      <h1>Network Monitor</h1>
      
      <div className="network-controls">
        <button onClick={switchToBestEndpoint}>
          Switch to Best Endpoint
        </button>
        
        <label>
          <input
            type="checkbox"
            checked={isAutoSwitchEnabled}
            onChange={toggleAutoSwitch}
          />
          Auto-switch to best endpoint
        </label>
      </div>
      
      <NetworkStatusDashboard
        showEndpointManager={true}
        showPerformanceMetrics={true}
        refreshInterval={30000} // 30 seconds
      />
    </div>
  );
}
```

### Error Log Viewer

```tsx
import { ErrorLogViewer } from "@/components/error/error-log-viewer";
import { useErrorMonitoring } from "@/hooks/useErrorMonitoring";

function ErrorMonitor() {
  const { clearResolvedErrors } = useErrorMonitoring();
  
  return (
    <div>
      <h1>Error Monitor</h1>
      
      <div className="error-controls">
        <button onClick={clearResolvedErrors}>
          Clear Resolved Errors
        </button>
      </div>
      
      <ErrorLogViewer
        showFilters={true}
        showResolutionOptions={true}
        maxItems={50}
        autoRefresh={true}
      />
    </div>
  );
}
```

### Common Components

```tsx
import { CardContainer } from "@/components/ui/card-container";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

function ExampleComponent() {
  return (
    <CardContainer
      title="Example Card"
      description="This is an example of using common UI components"
      headerAction={
        <StatusBadge variant="success" size="sm">
          Active
        </StatusBadge>
      }
    >
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          <TabsTrigger value="tab2">Tab 2</TabsTrigger>
        </TabsList>
        
        <TabsContent value="tab1">
          <p>This is the content of tab 1.</p>
          
          <div className="button-group">
            <Button variant="outline">Cancel</Button>
            <Button variant="default">Submit</Button>
          </div>
        </TabsContent>
        
        <TabsContent value="tab2">
          <p>This is the content of tab 2.</p>
          
          <StatusBadge variant="warning" size="md">
            Warning
          </StatusBadge>
        </TabsContent>
      </Tabs>
    </CardContainer>
  );
}
```

## Component Customization

Most components accept customization props for styling and behavior:

```tsx
// Customizing a CardContainer
<CardContainer
  title="Custom Card"
  description="A card with custom styling"
  className="custom-card"
  headerClassName="custom-header"
  contentClassName="custom-content"
  isLoading={isLoading}
  loadingText="Loading card data..."
  headerAction={<CustomHeaderAction />}
  footerAction={<CustomFooterAction />}
>
  {/* Card content */}
</CardContainer>

// Customizing a Button
<Button
  variant="default" // default, outline, ghost, link, destructive
  size="md" // sm, md, lg
  className="custom-button"
  disabled={isDisabled}
  isLoading={isLoading}
  loadingText="Processing..."
  onClick={handleClick}
  icon={<CustomIcon />}
>
  Click Me
</Button>
```

## Accessibility

All components are designed with accessibility in mind:

- Proper ARIA attributes
- Keyboard navigation
- Focus management
- Color contrast
- Screen reader support

## Theming

Components support theming through CSS variables:

```css
:root {
  /* Base colors */
  --color-primary: #3b82f6;
  --color-secondary: #10b981;
  --color-accent: #8b5cf6;
  --color-background: #ffffff;
  --color-foreground: #1f2937;
  
  /* Status colors */
  --color-success: #10b981;
  --color-warning: #f59e0b;
  --color-error: #ef4444;
  --color-info: #3b82f6;
  
  /* Typography */
  --font-family: 'Inter', sans-serif;
  --font-size-sm: 0.875rem;
  --font-size-md: 1rem;
  --font-size-lg: 1.125rem;
  
  /* Spacing */
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;
  --spacing-xl: 2rem;
  
  /* Borders */
  --border-radius-sm: 0.25rem;
  --border-radius-md: 0.5rem;
  --border-radius-lg: 0.75rem;
  --border-width: 1px;
}

/* Dark theme */
.dark-theme {
  --color-background: #1f2937;
  --color-foreground: #f9fafb;
  /* ... other dark theme variables */
}
```

## Best Practices

1. **Use the appropriate component**: Choose the right component for the task to maintain consistency.
2. **Provide feedback**: Use loading states and status indicators to keep users informed.
3. **Handle errors gracefully**: Use error boundaries and error components to prevent UI crashes.
4. **Optimize performance**: Use memoization and virtualization for lists and tables with many items.
5. **Maintain accessibility**: Ensure all components are accessible to all users.
6. **Follow design patterns**: Adhere to established design patterns for a familiar user experience.
7. **Test thoroughly**: Test components in different states, screen sizes, and with keyboard navigation.

## Further Reading

For detailed information about each component, including API reference and usage examples, see the individual component documentation:

- [Transaction Components](./transaction-components.md)
- [Network Components](./network-components.md)
- [Error Components](./error-components.md)
- [Analytics Components](./analytics-components.md)
- [Common UI Components](./common-ui-components.md)
