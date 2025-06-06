import { Input } from "@/components/ui/input";
import { Button } from "../../components/ui/button";
import { useEffect, useState } from "react";
import Header from "../Components/Header";
import toast, { Toaster } from "react-hot-toast";
import { FaPlus } from "react-icons/fa";
import { auth } from "@/firebase";
import Modal from "@/components/ui/Modal";
import { BlurFade } from "@/components/magicui/blur-fade";
import {
  addDoc,
  query,
  collection,
  onSnapshot,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/firebase";
interface Todo {
  id: string;
  text: string;
  createdAt: Date | null;
}
function Home() {
  const authuser = auth.currentUser;
  const [task, setTask] = useState("");
  const [list, setList] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(false);

  const add = async () => {
    if (!authuser) {
      return;
    }
    const userid = authuser.uid;
    const todosRef = collection(db, "users", userid, "todos");
    setTask("");
    if(!task){
      toast.dismiss("w")
      toast.error("Type Something!", {
        id: "w",
      });
    }else{
      try {
        await addDoc(todosRef, {
          text: task,
          createdAt: serverTimestamp(),
        });
      } catch (err) {
        console.log(err);
      }
    }
   
  };
  useEffect(() => {
    if (!auth.currentUser) {
      return;
    }
    setLoading(true);
    const userid = auth.currentUser.uid;
    const todosRef = collection(db, "users", userid, "todos");
    const todoQuery = query(todosRef, orderBy("createdAt", "desc"));
    const unsubcribe = onSnapshot(todoQuery, (snapshot) => {
      const data = snapshot.docs.map((doc) => {
        const docData = doc.data();
        return {
          id: doc.id,
          text: docData.text,
          createdAt: docData.createdAt?.toDate(),
        };
      });
      setList(data);
      setLoading(false);
    });
    return () => unsubcribe();
  }, []);

  return (
    <>
      <Toaster></Toaster>
      <Header></Header>
      <main className="max-w-6xl p-2 m-auto ">
        <BlurFade className="bg-white flex m-auto w-full max-w-sm space-x-2">
          <Input
            value={task}
            onChange={(e) => setTask(e.target.value)}
            type="text"
            placeholder="Type Here"
          />
          <Button
            onClick={add}
            className="cursor-pointer bg-green-800"
            type="submit"
          >
            <FaPlus className="" />
          </Button>
        </BlurFade>
        {!loading ? (
          list.length > 0 ? (
            <ul className="grid lg:grid-cols-2 gap-4 mt-10 ">
              {list.map((item, index) => (
                <BlurFade
                  className="bg-white p-2 mt-4  rounded-2xl min-h-50 shadow-xl transition-colors "
                  key={item.id}
                  delay={index * 0.1}
                  inView={true}
                  direction="left"
                >
                  <div className="flex p-4 bg-green-800 text-white rounded h-6 text-xs items-center justify-between  ">
                    <div>
                      <span>{item.createdAt?.toLocaleDateString()} | </span>
                      <span>
                        {item.createdAt?.toLocaleTimeString(undefined, {
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: true,
                        })}
                      </span>
                    </div>
                    <Modal id={item.id}></Modal>
                  </div>
                  <div className="p-2">{item.text}</div>
                </BlurFade>
              ))}
            </ul>
          ) : (
            <div className="bg-white font-bold shadow-xl text-center mt-10 rounded-lg text-2xl  h-100 flex justify-center items-center">
              Add one to get started! 📝
            </div>
          )
        ) : (
          <div className="flex h-100 justify-center items-center">
            <span className="loading loading-spinner loading-lg text-green-400"></span>
          </div>
        )}
      </main>
    </>
  );
}
export default Home;
