import { Alert, AlertDescription, Input, Label, Select, SelectItem, SelectContent, SelectTrigger, SelectValue, Separator, ExpandingArrow } from "@freelii/ui"

import { Button } from "@freelii/ui"
import { LinkIcon } from "lucide-react"

export const NewBusiness = () => {
    return (
        <div className="w-full max-w-2xl mx-auto space-y-6">
      <Alert className="bg-muted border-none">
        <LinkIcon className="h-4 w-4" />
        <AlertDescription>
          Want to invite businesses to register themselves? Share an invite link and let them complete their own
          registration as partners.
          <Button className="h-auto p-0 ml-2">
            Get invite link
          </Button>
        </AlertDescription>
      </Alert>

      <div>
        <div className="text-center space-y-4">
          <h2 className="text-4xl font-medium">Add a business</h2>
          <p className="text-lg">Complete the following steps to add your business.</p>
        </div>
        <div className="space-y-8">
          <div className="flex gap-6">
            <div className="w-1/3 space-y-4">
              <h2 className="text-xl font-semibold">Next Steps</h2>
              <ol className="space-y-2 list-decimal list-inside">
                <li>Enter compliance data</li>
                <li>Verify business details</li>
                <li>Set up payment methods</li>
                <li>Review and confirm</li>
              </ol>
            </div>
            <Separator orientation="vertical" className="mx-4" />
            <div className="w-2/3 space-y-6">
              <div className="space-y-2">
                <h2 className="text-xl font-semibold">Step 1: Compliance Data</h2>
                <p className="text-muted-foreground">Essential details about your business.</p>
              </div>
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="legal-name">Legal name*</Label>
                  <Input id="legal-name" placeholder="Enter legal name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tax-id">Tax ID (government id number)*</Label>
                  <Input id="tax-id" placeholder="Enter tax ID" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="formation-date">Formation date*</Label>
                  <Input id="formation-date" type="date" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email*</Label>
                  <Input id="email" type="email" placeholder="Enter email address" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">Country*</Label>
                  <Select>
                    <SelectTrigger id="country">
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="us">United States</SelectItem>
                      <SelectItem value="uk">United Kingdom</SelectItem>
                      <SelectItem value="ca">Canada</SelectItem>
                      {/* Add more countries as needed */}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button className="w-full mt-4">
                Next Step
                <ExpandingArrow className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
    )
}
