import React, { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Edit, Trash2, Plus, Play, FileText, HelpCircle } from 'lucide-react';

const SortableItem = ({ 
  item, 
  index, 
  onEdit, 
  onDelete, 
  type, 
  renderItem,
  getItemIcon, 
  getItemSubtext 
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white border rounded-lg shadow-sm transition-shadow ${
        isDragging 
          ? 'shadow-lg ring-2 ring-purple-500 ring-opacity-50 opacity-75' 
          : 'hover:shadow-md'
      }`}
    >
      <div className="p-4">
        <div className="flex items-center space-x-4">
          {/* Drag handle */}
          <div
            {...attributes}
            {...listeners}
            className="flex-shrink-0 cursor-grab active:cursor-grabbing"
          >
            <GripVertical className="w-5 h-5 text-gray-400 hover:text-gray-600" />
          </div>

          {/* Item icon */}
          <div className="flex-shrink-0">
            {getItemIcon(item)}
          </div>

          {/* Item content */}
          <div className="flex-1 min-w-0">
            {renderItem ? (
              renderItem(item, index)
            ) : (
              <div>
                <h4 className="text-sm font-medium text-gray-900 truncate">
                  {item.title}
                </h4>
                <p className="text-sm text-gray-500">
                  {getItemSubtext(item)}
                </p>
              </div>
            )}
          </div>

          {/* Position indicator */}
          <div className="flex-shrink-0">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
              #{item.position || index + 1}
            </span>
          </div>

          {/* Actions */}
          <div className="flex-shrink-0 flex items-center space-x-2">
            <button
              type="button"
              onClick={() => onEdit(item.id)}
              className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
              title="Chỉnh sửa"
            >
              <Edit className="w-4 h-4" />
            </button>            <button
              type="button"
              onClick={() => onDelete(item.id)}
              className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
              title="Xóa"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const DragDropList = ({ 
  items, 
  onReorder, 
  onEdit, 
  onDelete, 
  onAdd, 
  type = 'section', // 'section', 'lesson', 'quiz'
  renderItem,
  addButtonText,
  emptyMessage
}) => {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = items.findIndex((item) => item.id === active.id);
      const newIndex = items.findIndex((item) => item.id === over.id);
      
      const newItems = arrayMove(items, oldIndex, newIndex);
      
      // Update positions
      const updatedItems = newItems.map((item, index) => ({
        ...item,
        position: index + 1
      }));

      onReorder(updatedItems);
    }
  };

  const getItemIcon = (item) => {
    if (type === 'section') return <FileText className="w-5 h-5 text-gray-500" />;
    if (type === 'lesson') return item.video_url ? <Play className="w-5 h-5 text-blue-500" /> : <FileText className="w-5 h-5 text-gray-500" />;
    if (type === 'quiz') return <HelpCircle className="w-5 h-5 text-purple-500" />;
    return <FileText className="w-5 h-5 text-gray-500" />;
  };

  const getItemSubtext = (item) => {
    if (type === 'section') {
      const lessonCount = item.lessons?.length || 0;
      const quizCount = item.quizzes?.length || 0;
      return `${lessonCount} bài học, ${quizCount} bài kiểm tra`;
    }
    if (type === 'lesson') return item.video_url ? 'Video bài học' : 'Bài học văn bản';
    if (type === 'quiz') {
      const questionCount = item.questions?.length || 0;
      return `${questionCount} câu hỏi`;
    }
    return '';
  };

  if (!items || items.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto h-12 w-12 text-gray-400 mb-4">
          {type === 'section' && <FileText className="w-12 h-12" />}
          {type === 'lesson' && <Play className="w-12 h-12" />}
          {type === 'quiz' && <HelpCircle className="w-12 h-12" />}
        </div>
        <h3 className="mt-2 text-sm font-medium text-gray-900">{emptyMessage}</h3>
        <div className="mt-6">
          <button
            type="button"
            onClick={onAdd}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
          >
            <Plus className="w-4 h-4 mr-2" />
            {addButtonText}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Add button */}
      <div className="flex justify-end">
        {/* <button
          type="button"
          onClick={onAdd}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-purple-600 bg-purple-100 hover:bg-purple-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
        >
          <Plus className="w-4 h-4 mr-2" />
          {addButtonText}
        </button> */}
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={items.map(item => item.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-3">
            {items.map((item, index) => (
              <SortableItem
                key={item.id}
                item={item}
                index={index}
                onEdit={onEdit}
                onDelete={onDelete}
                type={type}
                renderItem={renderItem}
                getItemIcon={getItemIcon}
                getItemSubtext={getItemSubtext}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
};

export default DragDropList;
