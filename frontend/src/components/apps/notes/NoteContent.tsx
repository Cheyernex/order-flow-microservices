import React, { useContext, useState, useEffect } from 'react';
import { TbCheck } from 'react-icons/tb';
import { Textarea } from 'src/components/ui/textarea';
import { NotesContext, NotesContextType } from 'src/context/notes-context/index';
import { notesType } from 'src/types/apps/notes';

interface colorsType {
  lineColor: string;
  disp: string;
  id: number;
}

const NoteContent = () => {
  const { notes, updateNote, selectedNoteId }: NotesContextType = useContext(NotesContext);
  const noteDetails = notes.find((note: notesType) => note.id === selectedNoteId);

  // Initialize state for updatedTitle, initialTitle, and isEditing status
  const [initialTitle, setInitialTitle] = useState('');
  const [updatedTitle, setUpdatedTitle] = useState('');
  const [isEditing, setIsEditing] = useState(false); // State to track whether editing is in progress

  // Effect to update initialTitle when noteDetails changes
  useEffect(() => {
    if (noteDetails) {
      setInitialTitle(noteDetails.title);
      setUpdatedTitle(noteDetails.title);
    }
  }, [noteDetails]);

  // Function to handle changes in the title text field
  const handleTitleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setUpdatedTitle(e.target.value);
    setIsEditing(true); // Set editing state to true when user starts editing
  };

  // Function to handle color change and update note
  const handleColorChange = (color: string) => {
    const titleToUse = isEditing ? updatedTitle : initialTitle;
    updateNote(selectedNoteId, titleToUse, color);
  };

  // Function to save changes on blur event
  const handleBlur = () => {
    setIsEditing(false); // Reset editing state when user finishes editing
    // Call updateNote to save changes with the current color
    if (noteDetails) {
      updateNote(selectedNoteId, updatedTitle, noteDetails.color);
    }
  };

  const colorvariation: colorsType[] = [
    {
      id: 1,
      lineColor: 'warning',
      disp: 'warning',
    },
    {
      id: 2,
      lineColor: 'primary',
      disp: 'primary',
    },
    {
      id: 3,
      lineColor: 'error',
      disp: 'error',
    },
    {
      id: 4,
      lineColor: 'success',
      disp: 'success',
    },
    {
      id: 5,
      lineColor: 'secondary',
      disp: 'secondary',
    },
  ];

  return (
    <>
      <div className="flex grow p-6">
        {/* ------------------------------------------- */}
        {/* Edit notes */}
        {/* ------------------------------------------- */}
        {noteDetails ? (
          <div className="w-full">
            <Textarea
              id="outlined-multiline-static"
              placeholder="Edit Note"
              rows={5}
              value={isEditing ? updatedTitle : initialTitle}
              onChange={handleTitleChange}
              className="w-full p-6 form-control-textarea"
              onBlur={handleBlur}
            />
            <br />
            <h6 className="text-base mb-3">Change Note Color</h6>

            <div className="flex gap-2 items-center">
              {colorvariation.map((color1) => (
                <div
                  className={`h-7 w-7 flex justify-center items-center rounded-full cursor-pointer  bg-${color1?.disp}`}
                  key={color1.id}
                  onClick={() => handleColorChange(color1.disp)}
                >
                  {noteDetails.color === color1.disp ? (
                    <TbCheck width="18" className="text-white" />
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center w-full py-6 text-2xl text-muted-foreground">Select a Note</div>
        )}
      </div>
    </>
  );
};

export default NoteContent;
