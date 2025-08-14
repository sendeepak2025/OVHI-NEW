import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "@/redux/store";
import { getPatinetNotes } from "@/services/operations/patient";
import { FileText, Clock, Plus } from "lucide-react";
import Loader from "@/components/Loader";

interface PcmNotesProps {
  onNotesUpdate?: () => void;
  type?: string;
}

interface Note {
  created: string;
  note: string;
  type?: string;
  duration?: number;
}

const RpmNotes = ({ onNotesUpdate, type = "rpm" }: PcmNotesProps) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(false); // Initialize loading to false
  const { id } = useParams();
  const { token } = useSelector((state: RootState) => state.auth);

  const fetchPatientNotes = async () => {
    try {
      setLoading(true); // Set loading to true when fetch starts
      const res = await getPatinetNotes(id, token);
      if (res && res.data) {
        setNotes(res.data);
      }
    } catch (error) {
      console.error("Failed to fetch patient notes:", error);
    } finally {
      setLoading(false); // Set loading to false when fetch completes (success or error)
    }
  };

  useEffect(() => {
    if (id) {
      fetchPatientNotes();
    }
  }, [id]);

  const filteredNotes = notes.filter(
    (note) => note.type?.toLowerCase() === type
  );

  return (
    <div className="space-y-6">
      <ScrollArea className="h-[400px]">
        <div className="space-y-4">
          {loading ? (
            <Loader />
          ) : filteredNotes.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              No notes found.
            </div>
          ) : (
            filteredNotes.map((note, index) => (
              <Card key={index} className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {new Date(note?.created).toLocaleString()}
                    </span>
                  </div>
                  <Badge variant="outline">
                    Type: {note.type?.toUpperCase() || "N/A"}
                  </Badge>
                </div>
                <div className="mt-2">
                  <p className="text-sm leading-relaxed">{note.note}</p>
                </div>
                <div className="mt-2">
                  Duration: {note?.duration ? `${note.duration} m` : "NA"}
                </div>
              </Card>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default RpmNotes;
