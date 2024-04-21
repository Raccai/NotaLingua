import React, { ReactNode, createContext, useContext, useState } from 'react';
import db from '@/database/database';
import { SQLStatementArg } from 'expo-sqlite';
import { useToast } from './ToastContext';

type Word = {
    id: number,
    word: string,
    pronunciation: string,
    language: string,
    plural: string,
    partOfSpeech: string,
    thematicGroup: string,
    meaning: string,
    etymology: string,
};

type WordsContextType = {
    allWords: Word[],
    fetchWords: (filters?: {
        word?: string,
        language?: string,
        partOfSpeech?: string,
        thematicGroup?: string
    }) => void,
    fetchWordDetails: (wordID: number) => void,
    fetchWordsForDelete: () => void,
    sortWords: (sortParams: {
        word?: string, 
        language?: string,
        partOfSpeech?: string,
        thematicGroup?: string,
    }) => void,
    deleteAllWords: () => void,
    deleteMultipleWords: (selectedIDs: number[] | undefined) => void,
    deleteWord: (wordID: number) => void,
    updateWord: (filters: {
        word?: string,
        pronunciation?: string,
        language?: string,
        plural?: string,
        partOfSpeech?: string,
        thematicGroup?: string,
        meaning?: string,
        etymology?: string,
        params?: number,
    }) => void,
    saveWord: (filters: {
        word: string,
        pronunciation: string,
        language: string,
        plural: string,
        partOfSpeech: string,
        thematicGroup: string,
        meaning: string,
        etymology: string,
    }) => void,
    triggerRefetch: () => void,
    resetRefetchTrigger: () => void,
    triggerLoading: () => void,
    resetLoading: () => void,
    shouldRefetch: boolean,
    isSorted: boolean,
    isLoading: boolean,
    isError: boolean,
    selectedWord: Word | null,
};

const defaultContextValue: WordsContextType = {
    allWords: [],
    fetchWords: () => {},
    fetchWordDetails: () => {},
    fetchWordsForDelete: () => {},
    sortWords: () => {},
    deleteAllWords: () => {},
    deleteMultipleWords: () => {},
    deleteWord: () => {},
    updateWord: () => {},
    saveWord: () => {},
    triggerRefetch: () => {},
    resetRefetchTrigger: () => {},
    triggerLoading: () => {},
    resetLoading: () => {},
    shouldRefetch: false,
    isSorted: false,
    isLoading: true,
    isError: false,
    selectedWord: null,
};

const WordsContext = createContext<WordsContextType>(defaultContextValue);

interface WordsContextProviderProps {
    children: ReactNode;
}

export const WordsContextProvider: React.FC<WordsContextProviderProps> = ({ children }) => {
    const [allWords, setAllWords] = useState<Word[]>([]);
    const [shouldRefetch, setShouldRefetch] = useState(true);
    const [isSorted, setIsSorted] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isError, setIsError] = useState(false);
    const [selectedWord, setSelectedWord] = useState<Word | null>(null);
    const { showToast }= useToast();

    const triggerRefetch = () => setShouldRefetch(true);
    const resetRefetchTrigger = () => setShouldRefetch(false);
    const triggerLoading = () => setIsLoading(true);
    const resetLoading = () => setIsLoading(false);

    const fetchWords = async (filters?: {
        word?: string,
        language?: string,
        partOfSpeech?: string,
        thematicGroup?: string
    }) => {
        let query = "SELECT * FROM words";
        const conditions = [];
        const values: SQLStatementArg[] | undefined = [];
    
        if (filters) {
            // Check each filter and add to conditions if they are present
            if (filters.word) {
                conditions.push("word LIKE ?");
                values.push(`%${filters.word}%`);
            }
            if (filters.language) {
                conditions.push("language = ?");
                values.push(filters.language);
            }
            if (filters.partOfSpeech) {
                conditions.push("partOfSpeech = ?");
                values.push(filters.partOfSpeech);
            }
            if (filters.thematicGroup) {
                conditions.push("thematicGroup = ?");
                values.push(filters.thematicGroup);
            }
    
            // Combine all conditions with 'AND'
            if (conditions.length) {
                query += " WHERE " + conditions.join(" AND ");
            }
        }
    
        db.transaction(tx => {
            tx.executeSql(
                query, 
                values,
                (_, result) => {
                    setAllWords(result.rows._array || []);
                    setIsError(false);
                    setIsLoading(false);
                    resetRefetchTrigger();
                },
                (_, error) => {
                    showToast("Could not fetch words.", "fail");
                    setIsError(true);
                    setIsLoading(false);
                    return true;
                }
            );
        });
    };    

    const fetchWordDetails = (wordID: number) => {
        db.transaction(tx => {
            tx.executeSql(
                "SELECT * FROM words WHERE id = (?)", 
                [wordID],
                (_, result) => {
                    const rowData = result.rows.item(0);
                    if (rowData) {
                        setSelectedWord(rowData);
                        setIsError(false);
                    } else {
                        showToast("Word not found.", "fail");
                        setIsError(true);
                    }
                },
                (_, error) => {
                    showToast("Could not fetch word data.", "fail");
                    setIsError(true);
                    return true;
                }
            )
        });
    }

    const fetchWordsForDelete = () => {
        db.transaction(tx => {
            tx.executeSql(
                "SELECT * FROM words",
                [],
                (tx, result) => {
                    setAllWords(result.rows._array);
                    setIsError(false);
                    console.log("Fetched words for multiple deletion.");
                }, (tx, error) => {
                    setIsError(true);
                    console.log("Could not fetch words for multiple deletion: ", error);
                    return true
                }
            )
        })
    }

    const sortWords = (sortParams: {
        word?: string,
        language?: string,
        partOfSpeech?: string,
        thematicGroup?: string,
    }) => {
        const isAnyParamDefined = Object.values(sortParams).some(param => param !== undefined);
    
        setIsSorted(isAnyParamDefined); // Update here directly based on if any param is defined
    
        if (isAnyParamDefined) {
            const sortedWords = [...allWords].sort((a, b) => {
                const keys: (keyof typeof sortParams)[] = ["word", "language", "partOfSpeech", "thematicGroup"];
                for (let key of keys) {
                    if (sortParams[key]) {
                        let result = a[key].localeCompare(b[key], undefined, { numeric: true });
                        if (sortParams[key] === "desc") result = -result;
                        if (result !== 0) return result;
                    }
                }
                return 0;
            });
            setAllWords(sortedWords);
        } else {
            triggerRefetch(); // Ensure to re-fetch if unsorted to reset to initial state
        }
    };

    const deleteAllWords = () => {
        db.transaction(tx => {
            tx.executeSql(
                `INSERT INTO words_archive 
                (id, 
                word, 
                pronunciation, 
                language, 
                plural, 
                partOfSpeech, 
                thematicGroup, 
                meaning, 
                etymology, 
                dateAdded)
                SELECT 
                id, 
                word, 
                pronunciation, 
                language, 
                plural, 
                partOfSpeech, 
                thematicGroup, 
                meaning, 
                etymology, 
                dateAdded
                FROM words`,
                [],
                () => {
                tx.executeSql(
                        "DELETE FROM words",
                        [],
                        () => {
                            triggerRefetch();
                        },
                        (tx, error) => {
                            return true;
                        }
                    )
                }, 
                (tx, error) => {
                    return true;
                }
            )
            })
    };

    const deleteMultipleWords = (selectedIDs: number[] | undefined) => {
        if (selectedIDs?.length === 0) {
            console.log("No words selected.");
            showToast("No words selected.", "fail");
            return;
        }

        const idString = selectedIDs?.join(", ");
        db.transaction(tx => {
            tx.executeSql(
                `INSERT INTO words_archive 
                    (id, 
                    word, 
                    pronunciation, 
                    language, 
                    plural, 
                    partOfSpeech, 
                    thematicGroup, 
                    meaning, 
                    etymology, 
                    dateAdded)
                SELECT 
                    id, 
                    word, 
                    pronunciation, 
                    language, 
                    plural, 
                    partOfSpeech, 
                    thematicGroup, 
                    meaning, 
                    etymology, 
                    dateAdded
                FROM words
                WHERE id IN (${idString})`,
                [],
                () => {
                    tx.executeSql(
                        `DELETE FROM words WHERE id IN (${idString})`,
                        [],
                        () => {
                            setAllWords(prevWords => prevWords.filter(word => !selectedIDs?.includes(word.id)))
                            triggerRefetch();
                        },
                        (tx, error) => {
                            return true;
                        }
                    )
                }, (tx, error) => {
                    console.log("Could not delete selected words.");
                    return true;
                }
            )
        })
    };

    const deleteWord = (wordID: number) => {
        db.transaction(tx => {
            tx.executeSql(
                `INSERT INTO words_archive 
                (
                    id, 
                    word, 
                    pronunciation, 
                    language, 
                    plural, 
                    partOfSpeech, 
                    thematicGroup, 
                    meaning, 
                    etymology, 
                    dateAdded
                )
                SELECT 
                    id, 
                    word, 
                    pronunciation, 
                    language, 
                    plural, 
                    partOfSpeech, 
                    thematicGroup, 
                    meaning, 
                    etymology, 
                    dateAdded
                FROM words
                WHERE id = ?`,
                [wordID],
                () => {
                tx.executeSql(
                    "DELETE FROM words WHERE id = ?",
                    [wordID],
                    () => {
                        showToast("Successfully deleted word.", "success");
                        triggerRefetch();
                    },
                    (tx, error) => {
                        showToast("Error deleting word.", "fail");
                        return true;
                    }
                )
                }, 
                (tx, error) => {
                    showToast("Could not delete word.", "error");
                    return true;
                }
            )
        })
    };

    const updateWord = (filters: {
        word?: string,
        pronunciation?: string,
        language?: string,
        plural?: string,
        partOfSpeech?: string,
        thematicGroup?: string,
        meaning?: string,
        etymology?: string,
        params?: number,
    }) =>{
        db.transaction(tx => {
            tx.executeSql(
              `UPDATE words 
              SET word = ?, 
                  pronunciation = ?,
                  language = ?,
                  plural = ?,
                  partOfSpeech = ?,
                  thematicGroup = ?,
                  meaning = ?,
                  etymology = ?
              WHERE id = ?`, 
              [filters.word,
                filters.pronunciation, 
                filters.language, 
                filters.plural, 
                filters.partOfSpeech, 
                filters.thematicGroup, 
                filters.meaning, 
                filters.etymology, 
                filters.params as any],
              (tx, result) => {
                showToast("Successfully updated word.", "success");
              },
              (tx, error) => {
                showToast("Error updating word.", "error");
                return true;
              }
            )
          });
    };

    const saveWord = (filters: {
        word: string,
        pronunciation: string,
        language: string,
        plural: string,
        partOfSpeech: string,
        thematicGroup: string,
        meaning: string,
        etymology: string,
    }) => {
        db.transaction(tx => {
            tx.executeSql(
                `INSERT INTO words (
                    word, 
                    pronunciation,
                    language,
                    plural,
                    partOfSpeech,
                    thematicGroup,
                    meaning,
                    etymology
                ) values (?, ?, ?, ?, ?, ?, ?, ?)`, 
                [filters.word, 
                    filters.pronunciation, 
                    filters.language, 
                    filters.plural, 
                    filters.partOfSpeech, 
                    filters.thematicGroup, 
                    filters.meaning, 
                    filters.etymology],
                (_, result) => {
                    showToast("Successfully added word.", "success");
                },
                (_, error) => {
                    showToast("Error adding word to database.", "error");
                    return true;
                }
            )
            });
    };

    return (
        <WordsContext.Provider value={{ 
            allWords, 
            fetchWords, 
            fetchWordDetails,
            fetchWordsForDelete,
            sortWords, 
            deleteAllWords,
            deleteMultipleWords,
            deleteWord,
            updateWord,
            saveWord,
            triggerRefetch, 
            resetRefetchTrigger, 
            shouldRefetch, 
            triggerLoading,
            resetLoading,
            isLoading,
            isSorted,
            isError,
            selectedWord,
        }}>
            {children}
        </WordsContext.Provider>
    );
};

export const useWords = () => useContext(WordsContext);