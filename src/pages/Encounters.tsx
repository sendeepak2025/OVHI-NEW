import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { User, Activity } from "lucide-react";
import CreateTemplate from "./CreateTemplate";
import CreateEncountert from "./CreateEncountert";
import EncounterTable from "./EncounterTable";

const Encounters: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="lg:col-span-3">
        <Tabs defaultValue="encounters" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="encounters" className="flex items-center gap-1">
              <User className="h-4 w-4" />
              Encounters
            </TabsTrigger>
            <TabsTrigger value="templates" className="flex items-center gap-1">
              <Activity className="h-4 w-4" />
              Templates
            </TabsTrigger>
          </TabsList>

          <TabsContent value="encounters" className="space-y-6">
            <Card>
              <EncounterTable />
            </Card>
          </TabsContent>

          <TabsContent value="templates">
            <Card>
              <CreateTemplate />
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Encounters;
