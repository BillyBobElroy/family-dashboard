'use client';

import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { useFirebaseUser } from '@/hook/useFirebaseUser';
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
} from 'firebase/firestore';
import { nanoid } from 'nanoid';
import { CreateListModal } from '@/components/lists/CreateListModal';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

type ListItem = {
  id: string;
  text: string;
  checked: boolean;
};

type List = {
  id: string;
  title: string;
  items: ListItem[];
  createdBy: string;
};

type Member = {
  id: string;
  displayName: string;
  color?: string;
};

export default function ListsPage() {
  const { user } = useFirebaseUser();
  const [lists, setLists] = useState<List[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [newItemText, setNewItemText] = useState<{ [listId: string]: string }>({});
  const [expanded, setExpanded] = useState<{ [listId: string]: boolean }>({});

  const loadLists = async () => {
    if (!user?.familyId) return;

    const membersSnap = await getDocs(collection(db, `families/${user.familyId}/members`));
    const memberList: Member[] = membersSnap.docs.map(doc => ({
      id: doc.id,
      ...(doc.data() as Omit<Member, 'id'>),
    }));
    setMembers(memberList);

    const listsSnap = await getDocs(collection(db, `families/${user.familyId}/lists`));
    const fetchedLists: List[] = listsSnap.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        title: data.title,
        items: Array.isArray(data.items) ? data.items : [],
        createdBy: data.createdBy || '',
      };
    });

    setLists(fetchedLists);
    setLoading(false);
  };

  useEffect(() => {
    loadLists();
  }, [user]);

  const saveListItems = async (listId: string, updatedItems: ListItem[]) => {
    if (!user?.familyId) return;
    const sorted = [...updatedItems].sort((a, b) => Number(a.checked) - Number(b.checked));
    await updateDoc(doc(db, `families/${user.familyId}/lists/${listId}`), { items: sorted });
    setLists(prev => prev.map(list => list.id === listId ? { ...list, items: sorted } : list));
  };

  const handleToggle = (listId: string, itemId: string) => {
    const updated = lists.map(list => {
      if (list.id !== listId) return list;
      const items = list.items.map(item =>
        item.id === itemId ? { ...item, checked: !item.checked } : item
      );
      saveListItems(listId, items);
      return { ...list, items };
    });
    setLists(updated);
  };

  const handleTextChange = (listId: string, itemId: string, text: string) => {
    setLists(prev =>
      prev.map(list =>
        list.id === listId
          ? {
              ...list,
              items: list.items.map(item =>
                item.id === itemId ? { ...item, text } : item
              ),
            }
          : list
      )
    );
  };

  const handleItemBlur = (listId: string) => {
    const list = lists.find(l => l.id === listId);
    if (list) saveListItems(listId, list.items);
  };

  const handleAddItem = (listId: string) => {
    const text = newItemText[listId]?.trim();
    if (!text) return;
    const newItem: ListItem = {
      id: nanoid(),
      text,
      checked: false,
    };
    const list = lists.find(l => l.id === listId);
    if (!list) return;
    const updated = [...list.items, newItem];
    saveListItems(listId, updated);
    setNewItemText(prev => ({ ...prev, [listId]: '' }));
  };

  const handleDeleteItem = (listId: string, itemId: string) => {
    const list = lists.find(l => l.id === listId);
    if (!list) return;
    const updated = list.items.filter(item => item.id !== itemId);
    saveListItems(listId, updated);
  };

  const handleDeleteList = async (listId: string) => {
    if (!user?.familyId) return;
    await deleteDoc(doc(db, `families/${user.familyId}/lists/${listId}`));
    setLists(prev => prev.filter(list => list.id !== listId));
  };

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;
    const reordered = Array.from(lists);
    const [moved] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, moved);
    setLists(reordered);
  };

  const listsByMember = members.reduce((acc, member) => {
    acc[member.id] = lists.filter(list => list.createdBy === member.id);
    return acc;
  }, {} as Record<string, List[]>);

  return (
    <div className="min-h-screen bg-white p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Family Lists</h2>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
        >
          + New List
        </button>
      </div>

      {loading ? (
        <p className="text-gray-500">Loading lists...</p>
      ) : (
        members.map(member => (
          <div key={member.id} className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-10 h-10 rounded-full text-white font-semibold text-sm flex items-center justify-center"
                style={{ backgroundColor: member.color || '#3B82F6' }}
              >
                {member.displayName?.charAt(0).toUpperCase() || '?'}
              </div>
              <h3 className="text-lg font-semibold">{member.displayName || 'Unnamed'}</h3>
            </div>

            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId={`droppable-${member.id}`} direction="horizontal">
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="flex flex-wrap gap-4"
                  >
                    {listsByMember[member.id]?.map((list, index) => {
                      const activeItems = list.items.filter(i => !i.checked);
                      const completedItems = list.items.filter(i => i.checked);
                      const isExpanded = expanded[list.id];
                      const itemsToShow = isExpanded ? activeItems : activeItems.slice(0, 2);

                      return (
                        <Draggable key={list.id} draggableId={list.id} index={index}>
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className="p-4 rounded-xl shadow space-y-3 w-full sm:w-[300px]"
                              style={{
                                backgroundColor: member.color || '#F9FAFB',
                                ...provided.draggableProps.style,
                              }}
                            >
                              <div className="flex justify-between items-center">
                                <h4 className="font-semibold text-lg text-white">{list.title}</h4>
                                <button
                                  onClick={() => handleDeleteList(list.id)}
                                  className="text-white/80 hover:text-white text-lg"
                                >
                                  &times;
                                </button>
                              </div>

                              <ul className="space-y-2">
                                {itemsToShow.map(item => (
                                  <li key={item.id} className="flex items-center gap-3">
                                    <input
                                      type="checkbox"
                                      checked={item.checked}
                                      onChange={() => handleToggle(list.id, item.id)}
                                      className="w-5 h-5 accent-white bg-white/30 rounded"
                                    />
                                    <input
                                      type="text"
                                      value={item.text}
                                      onChange={(e) => handleTextChange(list.id, item.id, e.target.value)}
                                      onBlur={() => handleItemBlur(list.id)}
                                      className="flex-grow text-sm bg-transparent border-none text-white placeholder-white/80 focus:outline-none"
                                    />
                                    <button
                                      onClick={() => handleDeleteItem(list.id, item.id)}
                                      className="text-white/70 hover:text-red-200 text-lg"
                                    >
                                      &times;
                                    </button>
                                  </li>
                                ))}
                              </ul>

                              {!isExpanded && activeItems.length > 2 && (
                                <button
                                  onClick={() => setExpanded(prev => ({ ...prev, [list.id]: true }))}
                                  className="text-sm text-white/80 hover:underline"
                                >
                                  Show All
                                </button>
                              )}

                              {isExpanded && activeItems.length > 2 && (
                                <button
                                  onClick={() => setExpanded(prev => ({ ...prev, [list.id]: false }))}
                                  className="text-sm text-white/80 hover:underline"
                                >
                                  Collapse
                                </button>
                              )}

                              {completedItems.length > 0 && (
                                <>
                                  <p className="mt-3 text-xs text-white/60 uppercase font-semibold">Completed</p>
                                  <ul className="space-y-2 mt-1">
                                    {completedItems.map(item => (
                                      <li key={item.id} className="flex items-center gap-3 opacity-70">
                                        <input
                                          type="checkbox"
                                          checked={item.checked}
                                          onChange={() => handleToggle(list.id, item.id)}
                                          className="w-5 h-5 accent-white bg-white/30 rounded"
                                        />
                                        <input
                                          type="text"
                                          value={item.text}
                                          onChange={(e) => handleTextChange(list.id, item.id, e.target.value)}
                                          onBlur={() => handleItemBlur(list.id)}
                                          className="flex-grow text-sm bg-transparent border-none text-white line-through placeholder-white/80 focus:outline-none"
                                        />
                                        <button
                                          onClick={() => handleDeleteItem(list.id, item.id)}
                                          className="text-white/60 hover:text-red-300 text-lg"
                                        >
                                          &times;
                                        </button>
                                      </li>
                                    ))}
                                  </ul>
                                </>
                              )}

                              <div className="flex gap-2 mt-2">
                                <input
                                  type="text"
                                  value={newItemText[list.id] || ''}
                                  onChange={(e) =>
                                    setNewItemText(prev => ({ ...prev, [list.id]: e.target.value }))
                                  }
                                  placeholder="New item..."
                                  className="flex-grow border px-3 py-1 rounded text-sm"
                                />
                                <button
                                  onClick={() => handleAddItem(list.id)}
                                  className="bg-white text-black px-3 py-1 rounded hover:bg-gray-200"
                                >
                                  Add
                                </button>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      );
                    })}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          </div>
        ))
      )}

      {showModal && (
        <CreateListModal onClose={() => setShowModal(false)} onListCreated={loadLists} />
      )}
    </div>
  );
}