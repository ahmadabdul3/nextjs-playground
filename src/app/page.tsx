'use client'

import Image from "next/image";
import styles from "./page.module.css";
import { 
  useFormEmailInput, 
  FormTextInput, 
  useFormTextInput,
  FormPasswordInput
} from "@/components/form-fields/form-input";

export default function Home() {
  const { emailInput } = useFormEmailInput();
  const { textInput } = useFormTextInput({
    label: 'Full Name',
    isRequired: true,
  });

  return (
    <div className={styles.page}>
      <div>
        { emailInput }
        <FormTextInput 
          label='Password' 
          uncontrolled
        />
        { textInput }
        <FormPasswordInput />
      </div>
    </div>
  );
}
