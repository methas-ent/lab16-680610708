import { useState } from "react";
import { PlusCircle, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
  useComboboxAnchor,
} from "@/components/ui/combobox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { useEnrollmentStore } from "@/lib/enrollment-store";

export default function AdminCoursesPage() {
  const { courses, addCourse, removeCourse, removeInstructor } = useEnrollmentStore();
  const [courseCode, setCourseCode] = useState("");
  const [courseTitle, setCourseTitle] = useState("");
  const [formInstructors, setFormInstructors] = useState<string[]>([]);
  const [instructorQuery, setInstructorQuery] = useState("");
  const [courseDialogOpen, setCourseDialogOpen] = useState(false);
  const instructorAnchor = useComboboxAnchor();
  const instructorOptions = Array.from(
    new Set(courses.flatMap((course) => course.instructors ?? [])),
  );
  const normalizedInstructorQuery = instructorQuery.trim();
  const hasInstructorMatch = instructorOptions.some(
    (name) => name.toLowerCase() === normalizedInstructorQuery.toLowerCase(),
  );
  const instructorItems = normalizedInstructorQuery && !hasInstructorMatch
    ? [...instructorOptions, normalizedInstructorQuery]
    : instructorOptions;
  const duplicateCourse = courses.find(
    (course) => course.courseCode.toLowerCase() === courseCode.trim().toLowerCase(),
  );
  const duplicateCode = Boolean(duplicateCourse);

  const handleAddCourse = () => {
    if (!courseCode.trim() || !courseTitle.trim() || duplicateCode) return;

    addCourse({
      courseCode: courseCode.trim().toUpperCase(),
      courseTitle: courseTitle.trim(),
      instructors: formInstructors,
    });
    setCourseCode("");
    setCourseTitle("");
    setFormInstructors([]);
    setInstructorQuery("");
    setCourseDialogOpen(false);
  };

  const handleCourseDialogOpenChange = (open: boolean) => {
    setCourseDialogOpen(open);
    if (!open) {
      setCourseCode("");
      setCourseTitle("");
      setFormInstructors([]);
      setInstructorQuery("");
    }
  };

  return (
    <div>
      <div className="flex justify-between">
        <div>
          <h1 className="text-xl">จัดการวิชาเรียน</h1>
          <p className="mb-5 text-x text-gray-500">
            {courses.length} วิชา — เพิ่มวิชาใหม่ที่นี่แล้วจะไปโผล่เป็นตัวเลือก ตอนลงทะเบียนให้นักศึกษาที่หน้า "จัดการการลงทะเบียน" ทันที
          </p>
        </div>

        <div>
          <Dialog open={courseDialogOpen} onOpenChange={handleCourseDialogOpenChange}>
            <DialogTrigger render={<Button />}>
              <PlusCircle className="h-4 w-4" />
              เพิ่มวิชา
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>เพิ่มวิชาใหม่</DialogTitle>
                <DialogDescription>
                  วิชาที่เพิ่มจะไปโผล่เป็นตัวเลือกตอนลงทะเบียนให้นักศึกษาได้ทันที
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4">
                <div className="grid gap-1.5">
                  <Label htmlFor="courseCode">รหัสวิชา</Label>
                  <Input
                    id="courseCode"
                    value={courseCode}
                    onChange={(event) => setCourseCode(event.target.value)}
                    placeholder="เช่น CPE303"
                    aria-invalid={duplicateCode}
                  />
                  {duplicateCode && (
                    <p className="text-sm text-red-600">
                      มีรหัสวิชา {duplicateCourse?.courseCode} นี้แล้ว
                    </p>
                  )}
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="courseTitle">ชื่อวิชา</Label>
                  <Input
                    id="courseTitle"
                    value={courseTitle}
                    onChange={(event) => setCourseTitle(event.target.value)}
                    placeholder="เช่น Mobile Application Development"
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="instructorsInput">ผู้สอน</Label>
                  <Combobox
                    multiple
                    items={instructorItems}
                    value={formInstructors}
                    inputValue={instructorQuery}
                    onInputValueChange={setInstructorQuery}
                    onValueChange={(value) => setFormInstructors(value as string[])}
                  >
                    <ComboboxChips ref={instructorAnchor}>
                      <ComboboxValue>
                        {(selected: string[]) => selected.map((name) => (
                          <ComboboxChip key={name}>
                            {name}
                          </ComboboxChip>
                        ))}
                      </ComboboxValue>
                      <ComboboxChipsInput
                        id="instructorsInput"
                        placeholder={
                          formInstructors.length === 0
                            ? "เลือกหรือพิมพ์ชื่อผู้สอนได้หลายคน"
                            : ""
                        }
                      />
                    </ComboboxChips>
                    <ComboboxContent anchor={instructorAnchor.current}>
                      <ComboboxList>
                        {instructorOptions.map((name) => (
                          <ComboboxItem key={name} value={name}>
                            {name}
                          </ComboboxItem>
                        ))}
                        {normalizedInstructorQuery && !hasInstructorMatch && (
                          <ComboboxItem value={normalizedInstructorQuery}>
                            + เพิ่มผู้สอน "{normalizedInstructorQuery}"
                          </ComboboxItem>
                        )}
                      </ComboboxList>
                    </ComboboxContent>
                  </Combobox>
                </div>
              </div>
              <DialogFooter>
                <Button disabled={!courseCode.trim() || !courseTitle.trim() || duplicateCode} onClick={handleAddCourse}>
                  บันทึก
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>



      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>รหัสวิชา</TableHead>
              <TableHead>ชื่อวิชา</TableHead>
              <TableHead>ผู้สอน</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {courses.map((course) => (
              <TableRow key={course.courseCode}>
                <TableCell>{course.courseCode}</TableCell>
                <TableCell>{course.courseTitle}</TableCell>

                <TableCell>
                  {course.instructors?.length ? (
                    course.instructors.map((name) => (
                      <Badge key={name} variant="secondary" className="m-1 border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-300 hover:bg-blue-200">
                        {name}
                        <button
                          type="button"
                          aria-label={`ลบผู้สอน ${name}`}
                          onClick={() => removeInstructor(course.courseCode, name)}
                          className="  hover:text-red-700"
                        >
                          X
                        </button>
                      </Badge>
                    ))
                  ) : (
                    "ยังไม่มีผู้สอน"
                  )}
                </TableCell>

                <TableCell>
                  <AlertDialog>
                    <AlertDialogTrigger
                      render={<Button variant="ghost" size="icon" aria-label="ลบวิชา" className="text-red-600 hover:bg-gray-50 hover:text-red-700" />}
                    >
                      <Trash2 />
                    </AlertDialogTrigger>

                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>ลบวิชา?</AlertDialogTitle>
                        <AlertDialogDescription>
                          ลบ {course.courseCode} — {course.courseTitle} ออกจากรายวิชาที่เปิดสอน
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => removeCourse(course.courseCode)}
                          className="bg-red-500 hover:bg-red-600 text-white"
                        >
                          ยืนยัน
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>

        </Table>
      </div>
    </div>
  )
}