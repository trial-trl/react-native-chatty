import React, { createContext, useContext, useState } from 'react';

export const FetchingContext = createContext<
  [boolean, React.Dispatch<React.SetStateAction<boolean>>]
>([false, () => {}]);

export const FetchingContextProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  return (
    <FetchingContext.Provider value={useState<boolean>(false)}>
      {children}
    </FetchingContext.Provider>
  );
};

export const useFetchingContext = () => {
  return useContext(FetchingContext);
};
